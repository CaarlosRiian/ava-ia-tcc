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

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, } from "@/components/ui/select";

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

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Área de Especialidade <span className="text-red-500">*</span></Label>
                  <Select {...register("especialidade")}>
                    <SelectTrigger className="w-full h-12 p-5 rounded-x border-gray-200 bg-white  cursor-pointer">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>


                    <SelectContent className="rounded-xl border border-slate-200 bg-white shadow-lg min-w-[var(--radix-select-trigger-width)] z-[50]">
                      <SelectItem value="Programação" className="cursor-pointer hover:bg-slate-100 py-3">
                        Programação
                      </SelectItem>
                      <SelectItem value="Design" className="cursor-pointer hover:bg-slate-100 py-3">
                        Design
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Bio <span className="text-red-500">*</span></Label>
                  <textarea
                    {...register("bio")}
                    className="w-full min-h-[120px] border rounded-xl p-3"
                    placeholder="Descreva um pouco da sua carreira profissional..."
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
                  <Checkbox className="cursor-pointer" />
                  <Label>Concordo com os termos</Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2F52E0] hover:bg-[#1e3bb3] h-12 rounded-x cursor-pointer text-lg font-medium shadow-lg"
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