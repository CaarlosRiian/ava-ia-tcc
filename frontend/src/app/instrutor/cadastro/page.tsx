"use client";

import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";

import { FormHeader } from "./_components/form-header";
import { SocialLinksInput } from "./_components/social-links-input";
import { FileUpload } from "./_components/file-upload";

import { useCadastroInstrutor } from "./_components/use-cadastro-instrutor";

export default function CadastroInstrutor() {
  const { form, onSubmit } = useCadastroInstrutor();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = form;

  const arquivo = watch("arquivo");

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <FormHeader />

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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div>
                  <Label>Área de Especialidade *</Label>
                  <select
                    {...register("especialidade")}
                    className="w-full h-12 border rounded-xl p-2"
                  >
                    <option value="">Selecione</option>
                    <option value="Programação">Programação</option>
                    <option value="Design">Design</option>
                  </select>
                </div>

                <div>
                  <Label>Bio *</Label>
                  <textarea
                    {...register("bio")}
                    className="w-full min-h-[120px] border rounded-xl p-3"
                  />
                </div>

                <SocialLinksInput
                  linkedin={watch("linkedin") || ""}
                  setLinkedin={(v) => setValue("linkedin", v)}
                  portfolio={watch("portfolio") || ""}
                  setPortfolio={(v) => setValue("portfolio", v)}
                />

                <FileUpload
                  arquivo={arquivo}
                  setArquivo={(file) => setValue("arquivo", file)}
                />

                <div className="flex items-center gap-2">
                  <Checkbox />
                  <Label>Concordo com os termos</Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2F52E0]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}