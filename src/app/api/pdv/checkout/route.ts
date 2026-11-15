import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/db";
import {
  sales,
  saleItems,
  products,
  cashRegisters,
  productCompositions,
  cashbackCampaigns,
  customerCashbackBalance,
  customerCashbackLedger,
} from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      cashRegisterId,
      mode = "CASHIER", // 'CASHIER' ou 'SELF_CHECKOUT'
      operatorName = "Operador de Caixa",
      customerName,
      customerDocument,
      customerId, // 👈 ID opcional do cliente para vincular o cashback
      items, // Array de { productId, quantity, unitPrice, description }
      discount = 0,
      paymentMethod, // 'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'CONVENIO'
      changeGiven = 0,
      isSuspectedFraud = false,
    } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID não informado." },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "A venda não possui itens." },
        { status: 400 },
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Forma de pagamento não informada." },
        { status: 400 },
      );
    }

    // 1. Validar se o Turno de Caixa está aberto (validação prévia)
    if (cashRegisterId) {
      const [register] = await db
        .select()
        .from(cashRegisters)
        .where(
          and(
            eq(cashRegisters.id, cashRegisterId),
            eq(cashRegisters.companyId, companyId),
            eq(cashRegisters.status, "OPEN"),
          ),
        );

      if (!register) {
        return NextResponse.json(
          {
            error:
              "Turno de caixa fechado ou não encontrado. Abra o caixa antes de vender.",
          },
          { status: 400 },
        );
      }
    }

    // 2. Calcular Subtotal e Total
    let subtotal = 0;
    for (const item of items) {
      const q = Number(item.quantity || 1);
      const p = Number(item.unitPrice || 0);
      subtotal += q * p;
    }

    const discountAmount = Number(discount || 0);
    const total = Math.max(0, subtotal - discountAmount);

    const saleId = crypto.randomUUID();
    const saleStatus = isSuspectedFraud ? "SUSPECTED_FRAUD" : "COMPLETED";

    let cashbackEarned = 0;

    // 3. Execução Atômica via Transação Drizzle ORM
    await db.transaction(async (tx) => {
      // Inserir o cabeçalho da venda
      await tx.insert(sales).values({
        id: saleId,
        companyId,
        cashRegisterId: cashRegisterId || null,
        mode,
        operatorName,
        customerName: customerName
          ? String(customerName).trim().toUpperCase()
          : null,
        customerDocument: customerDocument
          ? String(customerDocument).replace(/\D/g, "")
          : null,
        subtotal: String(subtotal.toFixed(2)),
        discount: String(discountAmount.toFixed(2)),
        total: String(total.toFixed(2)),
        paymentMethod,
        status: saleStatus,
      });

      // Inserir itens e atualizar o stock com suporte a kits
      for (const item of items) {
        const q = Number(item.quantity || 1);
        const p = Number(item.unitPrice || 0);
        const itemSubtotal = q * p;

        await tx.insert(saleItems).values({
          id: crypto.randomUUID(),
          saleId,
          productId: item.productId,
          description: item.description,
          quantity: String(q),
          unitPrice: String(p.toFixed(2)),
          subtotal: String(itemSubtotal.toFixed(2)),
        });

        // Se a venda for legítima (sem suspeita de fraude), faz a gestão de stock
        if (!isSuspectedFraud) {
          const kitComponents = await tx
            .select()
            .from(productCompositions)
            .where(eq(productCompositions.productId, item.productId));

          if (kitComponents.length > 0) {
            for (const comp of kitComponents) {
              const requiredQty = Number(comp.quantity) || 1;
              const totalDeduction = requiredQty * q;

              const [componentProd] = await tx
                .select()
                .from(products)
                .where(eq(products.id, comp.componentProductId));

              if (componentProd) {
                const newComponentStock =
                  componentProd.stockCurrent - totalDeduction;
                await tx
                  .update(products)
                  .set({ stockCurrent: newComponentStock })
                  .where(eq(products.id, comp.componentProductId));
              }
            }
          } else {
            const [prod] = await tx
              .select()
              .from(products)
              .where(eq(products.id, item.productId));
            if (prod) {
              const newStock = prod.stockCurrent - q;
              await tx
                .update(products)
                .set({ stockCurrent: newStock })
                .where(eq(products.id, item.productId));
            }
          }
        }
      }

      // 4. Motor de Regras de Cashback Automático
      if (!isSuspectedFraud && customerId) {
        const now = new Date();
        // Buscar campanhas ativas para a empresa na data corrente
        const activeCampaigns = await tx
          .select()
          .from(cashbackCampaigns)
          .where(
            and(
              eq(cashbackCampaigns.companyId, companyId),
              eq(cashbackCampaigns.active, true),
              lte(cashbackCampaigns.startDate, now),
              gte(cashbackCampaigns.endDate, now),
            ),
          );

        if (activeCampaigns.length > 0) {
          // Utiliza a primeira regra global ou aplicável encontrada (ex: 5% padrão)
          const generalCampaign =
            activeCampaigns.find((c) => c.scope === "GLOBAL") ||
            activeCampaigns[0];
          const percentage = Number(generalCampaign.percentage) || 5.0;

          cashbackEarned = total * (percentage / 100);

          if (cashbackEarned > 0) {
            // Verificar se o cliente já possui saldo cadastrado
            const [existingBalance] = await tx
              .select()
              .from(customerCashbackBalance)
              .where(
                and(
                  eq(customerCashbackBalance.companyId, companyId),
                  eq(customerCashbackBalance.customerId, customerId),
                ),
              );

            const currentBalanceNum = existingBalance
              ? Number(existingBalance.balance)
              : 0;
            const newBalanceNum = currentBalanceNum + cashbackEarned;

            if (existingBalance) {
              await tx
                .update(customerCashbackBalance)
                .set({
                  balance: String(newBalanceNum.toFixed(2)),
                  updatedAt: new Date(),
                })
                .where(eq(customerCashbackBalance.id, existingBalance.id));
            } else {
              await tx.insert(customerCashbackBalance).values({
                id: crypto.randomUUID(),
                companyId,
                customerId,
                balance: String(cashbackEarned.toFixed(2)),
              });
            }

            // Registar no extrato (ledger) de cashback
            await tx.insert(customerCashbackLedger).values({
              id: crypto.randomUUID(),
              companyId,
              customerId,
              saleId,
              amount: String(cashbackEarned.toFixed(2)),
              type: "EARNED",
            });
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      saleId,
      total,
      changeGiven: Number(changeGiven || 0),
      cashbackEarned: Number(cashbackEarned.toFixed(2)), // 👈 Retornado para exibição no talão
      status: saleStatus,
      message: isSuspectedFraud
        ? "⚠️ Venda bloqueada por divergência no Self-Checkout. Gerente notificado!"
        : "Venda realizada com sucesso!",
    });
  } catch (error: unknown) {
    console.error("Erro no checkout do PDV:", error);
    const databaseCause =
      error instanceof Error && error.cause instanceof Error
        ? error.cause.message
        : null;
    const msg =
      databaseCause ||
      (error instanceof Error
        ? error.message
        : "Erro interno no processamento da venda.");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
