import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";

interface FormStatusBadgeProps {
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    errorMessage: string | null;
    saveSuccess: boolean;
}

export function FormStatusBadge({
    isSaving,
    hasUnsavedChanges,
    errorMessage,
    saveSuccess,
}: FormStatusBadgeProps) {

    if (isSaving) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-fade-in">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span>Salvando alterações...</span>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-fade-in">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>Erro: {errorMessage}</span>
            </div>
        );
    }

    if (saveSuccess) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Alterações salvas com sucesso!</span>
            </div>
        );
    }

    if (hasUnsavedChanges) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold px-4 py-3 rounded-xl shadow-lg animate-pulse">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Alterações pendentes não salvas</span>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 text-sm px-4 py-3 rounded-xl shadow-sm opacity-80">
            <Info className="h-4 w-4 text-gray-400" />
            <span>Perfil sincronizado</span>
        </div>
    );
}