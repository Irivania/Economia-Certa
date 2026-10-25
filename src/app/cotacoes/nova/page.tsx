'use client';

import { useTheme } from '@/context/ThemeContext';
import { AppHeader } from '@/components/AppHeader';
import { CommandMenu } from '@/components/CommandMenu';
import { useCommandMenu } from '@/hooks/useCommandMenu';
import { useQuotationCreation } from '@/features/quotations/hooks/useQuotationCreation';
import { CreateQuotationForm } from '@/features/quotations/components/CreateQuotationForm';

export default function CreateQuotationPage() {
  const { isDarkMode } = useTheme();
  const commandMenu = useCommandMenu();
  const quotationCreation = useQuotationCreation();

  return (
    <div className={`min-h-screen transition-colors duration-300 pb-24 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className="pb-12">
        <AppHeader
          title="Economia Certa"
          subtitle="Painel gerencial inteligente e controle de compras em tempo real."
          onOpenCmd={commandMenu.handleOpen}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-6">
        <CreateQuotationForm domain={quotationCreation} isDarkMode={isDarkMode} />
      </main>

      <CommandMenu 
        isOpen={commandMenu.isCmdOpen} 
        onClose={commandMenu.handleClose} 
        isDarkMode={isDarkMode} 
        latestQuotationId="" 
      />

    </div>
  );
}