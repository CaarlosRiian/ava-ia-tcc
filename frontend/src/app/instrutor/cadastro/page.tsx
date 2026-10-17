"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Breadcrumb from "@/components/BreadCrumb"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send, GraduationCap, X } from "lucide-react";

import { SocialLinksInput } from "./_components/social-links-input";
import { FileUpload } from "./_components/file-upload";
import { MeusEnviosList } from "./_components/meus-envios-list";

import { useCadastroInstrutor } from "./_components/use-cadastro-instrutor";
import { api } from "@/services/api";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "./_components/use-toast";
import Footer from "@/components/Footer";

interface MinhaSolicitacao {
  id: number;
  especialidade: string;
  status: "pending" | "approved" | "rejected" | "pendente" | "aprovado" | "rejeitado";
  created_at?: string;
}

export default function CadastroInstrutor() {
  const { form, onSubmit, categorias, loadingCategorias } = useCadastroInstrutor();
  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<MinhaSolicitacao[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(true);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false); 
  const { toast, activeToast, dismiss } = useToast();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors }, reset,
  } = form;

  const arquivo = watch("arquivo");
  const termos = watch("termos");

  const temPedidoPendente = minhasSolicitacoes.some(
    (s) => s.status === "pending" || s.status === "pendente"
  );

  async function fetchMinhasSolicitacoes() {
    try {
      setLoadingHistorico(true);
      const response = await api.get<MinhaSolicitacao[]>("/instructor-requests/");
      setMinhasSolicitacoes(response.data);
    } catch (err) {
      console.error("Erro ao buscar histórico", err);
    } finally {
      setLoadingHistorico(false);
    }
  }

  useEffect(() => {
    register("especialidade");
    register("termos");
    fetchMinhasSolicitacoes();
  }, [register]);

  const handleFormSubmit = async (data: any) => {
    if (temPedidoPendente) return;

    try {
      await onSubmit(data);

      toast({
        title: "Solicitação enviada!",
        description: "Seu cadastro foi recebido com sucesso e já está em análise.",
      });

      reset({
        especialidade: "",
        bio: "",
        linkedin: "",
        portfolio: "",
        arquivo: null,
        termos: false
      });

      fetchMinhasSolicitacoes();
    } catch (err) {
      console.error(err);

      toast({
        variant: "destructive",
        title: "Algo deu errado!",
        description: "Não foi possível enviar sua solicitação. Verifique os dados e tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative">
      <Header />

      <Breadcrumb items={[{ label: "Quero ser instrutor" }]} />

      <main className="flex-1 pt-6 pb-12 px-4 max-w-6xl w-full mx-auto space-y-10">
        
        <div className="flex items-center gap-6 text-left max-w-4xl">
          <div className="flex items-center justify-center w-20 h-20 bg-[#FF7A00] text-white rounded-[28px] shadow-md shrink-0">
            <GraduationCap className="w-10 h-10 stroke-[1.8]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">
              Torne-se um Instrutor
            </h1>
            <p className="text-lg text-gray-500 font-medium leading-relaxed">
              Sua jornada para impactar alunos através dos seus ensinos começa aqui.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="order-2 lg:order-1">
            <MeusEnviosList solicitacoes={minhasSolicitacoes} loading={loadingHistorico} />
          </div>
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-white border-b border-gray-100 p-8">
                <CardTitle className="text-xl font-bold">
                  Formulário de Cadastro
                </CardTitle>
                <CardDescription>
                  Campos com * são obrigatórios.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">
                      Área de Especialidade <span className="text-red-500">*</span>
                    </Label>
                    <Select value={watch("especialidade") || ""} onValueChange={(value) => setValue("especialidade", value, { shouldValidate: true })}
                      disabled={loadingCategorias} >
                      <SelectTrigger className="w-full h-12 p-5 rounded-xl border-gray-200 bg-white cursor-pointer">
                        <SelectValue placeholder={loadingCategorias ? "Buscando áreas..." : "Selecione"} />
                      </SelectTrigger>

                      <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg min-w-[var(--radix-select-trigger-width)] z-[50]">
                        {categorias.length === 0 && !loadingCategorias ? (
                          <div className="p-3 text-xs text-gray-400 text-center">Nenhuma especialidade disponível</div>
                        ) : (
                          categorias.map((cat) => (
                            <SelectItem
                              key={cat.id}
                              value={cat.name}
                              className="cursor-pointer hover:bg-slate-100 py-3"
                            >
                              {cat.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.especialidade && (<p className="text-xs text-red-500 font-semibold">{String(errors.especialidade.message)}</p>)}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Bio <span className="text-red-500">*</span></Label>
                    <textarea
                      {...register("bio")}
                      className="w-full min-h-[120px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/50 rounded-xl p-3 text-sm resize-y"
                      placeholder="Descreva um pouco da sua carreira profissional..."
                    />
                    {errors.bio && (<p className="text-xs text-red-500 font-semibold">{String(errors.bio.message)}</p>)}
                  </div>

                  <SocialLinksInput linkedin={watch("linkedin") || ""} setLinkedin={(v) => setValue("linkedin", v)} portfolio={watch("portfolio") || ""}
                    setPortfolio={(v) => setValue("portfolio", v)} />

                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <Label className="font-bold text-gray-700">
                        Comprovante de Qualificação ou Currículo <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-xs text-gray-400 mt-0.5">Anexe seu currículo, diploma ou certificado em PDF ou imagem.</span>
                    </div>
                    <FileUpload arquivo={arquivo} setArquivo={(file) => setValue("arquivo", file, { shouldValidate: true })} />
                    {errors.arquivo && (
                      <p className="text-xs text-red-500 font-semibold">{String(errors.arquivo.message)}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="termos" checked={!!termos} onCheckedChange={(checked) => setValue("termos", !!checked, { shouldValidate: true })}
                        className="cursor-pointer data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600" />
                      <Label htmlFor="termos" className="cursor-pointer text-sm text-gray-600">
                        Concordo com os{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsTermsModalOpen(true);
                          }}
                          className="text-[black] font-semibold hover:underline inline cursor-pointer"
                        >
                          termos e políticas de uso
                        </button>{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    {errors.termos && (
                      <p className="text-xs text-red-500 font-semibold">{String(errors.termos.message)}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting || temPedidoPendente} 
                    className="w-full bg-[#FF7A00] hover:bg-[#ea7306] h-12 rounded-xl cursor-pointer text-lg font-medium shadow-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Enviando..." : temPedidoPendente ? "Você já possui um pedido em análise" : "Enviar Solicitação"}
                  </Button>

                  {temPedidoPendente && (
                    <p className="text-xs text-gray-600 text-center font-medium mt-1">
                      Você só pode ter 1 pedido de especialidade em análise por vez. Aguarde a avaliação do admin.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {isTermsModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Termos e Políticas de Uso</h3>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-600 leading-relaxed">
              <p><strong>1. Aceitação dos Termos:</strong> Ao se cadastrar como instrutor na nossa plataforma, você concorda em cumprir e respeitar todas as diretrizes de qualidade, ética e conduta estabelecidas pela administração.</p>
              <p><strong>2. Conteúdo Educacional:</strong> Todo o material enviado (vídeos, resumos, documentos e avaliações) deve ser de sua autoria ou devidamente licenciado, respeitando os direitos de propriedade intelectual.</p>
              <p><strong>3. Processo de Análise:</strong> As solicitações de especialidade passam por uma avaliação individual da equipe administrativa. O prazo de resposta pode variar conforme a demanda.</p>
              <p><strong>4. Privacidade e Dados:</strong> Seus dados profissionais e de contato serão tratados com total segurança, utilizados exclusivamente para fins de validação e exibição no seu perfil público de instrutor.</p>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="px-5 py-2.5 bg-[#FF7A00] text-white text-sm font-semibold rounded-xl hover:bg-orange-500 transition-colors cursor-pointer"
              >
                Entendido e Concordo
              </button>
            </div>
          </div>
        </div>
      )}

      {activeToast && (
        <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`w-full max-w-sm p-5 rounded-2xl shadow-xl border flex items-start gap-3 relative min-w-[320px] ${activeToast.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-950"
            }`} >
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-bold">{activeToast.title}</h4>
              {activeToast.description && (
                <p className="text-xs opacity-90 leading-relaxed font-medium">{activeToast.description}</p>
              )}
            </div>
            <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg transition-colors" >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}