type Props = {
  challengeEnabled: boolean;
  onOpenModal: () => void;
  disabled?: boolean;
};

export const LessonChallengeSection = ({
  challengeEnabled,
  onOpenModal,
  disabled,
}: Props) => {
  return (
    <div className="pt-2 border-t border-gray-100 flex items-center justify-between bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200">
      <div>
        <p className="text-xs font-bold text-gray-800">Atividade Prática com IA</p>
        <p className="text-[11px] text-gray-500">
          {challengeEnabled ? "Configurada com sucesso" : "Opcional (Desativada)"}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenModal}
        disabled={disabled}
        className="px-3.5 py-1.5 text-xs font-bold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition shadow-sm cursor-pointer"
      >
        {challengeEnabled ? "Editar Atividade" : "Configurar Atividade"}
      </button>
    </div>
  );
};