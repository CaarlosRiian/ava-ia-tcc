"use client";

import { useState } from "react";
import { QrCode, CreditCard, Barcode, Copy, Lock, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentTabsProps {
  price: number;
  formattedPrice: string;
  onConfirm: () => void;
}

export default function PaymentTabs({ price, formattedPrice, onConfirm }: PaymentTabsProps) {
  const [method, setMethod] = useState<"pix" | "cartao" | "boleto">("pix");
  const pixKey = "ava-ia@pagamentos.com.br";

  const copyPix = () => {
    navigator.clipboard.writeText(pixKey);
    alert("Chave PIX copiada com sucesso!");
  };

  return (
    <div className="rounded-2xl border bg-card shadow-sm p-6 md:p-8">
      <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="pix" className="gap-2 cursor-pointer">
            <QrCode className="h-4 w-4" /> PIX
          </TabsTrigger>
          <TabsTrigger value="cartao" className="gap-2 cursor-pointer">
            <CreditCard className="h-4 w-4" /> Cartão
          </TabsTrigger>
          <TabsTrigger value="boleto" className="gap-2 cursor-pointer">
            <Barcode className="h-4 w-4" /> Boleto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pix" className="mt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="rounded-xl border bg-white p-3 shrink-0">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=ava-ia-mock-pix"
                alt="QR Code PIX fictício"
                className="h-60 w-60 object-cover rounded-md"
              />
            </div>
            <div className="flex-1 w-full space-y-3 text-sm">
              <div className="inline-flex items-center gap-2 text-primary font-semibold">
                <span className="text-lg">⚡</span> Pagamento via PIX
              </div>
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recebedor</span>
                  <span className="font-medium">AVA-IA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-medium">{formattedPrice}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Chave PIX</span>
                  <button
                    onClick={copyPix}
                    className="font-medium inline-flex items-center gap-1 hover:text-primary cursor-pointer border-none bg-transparent p-0"
                  >
                    {pixKey} <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Abra o app do seu banco, escaneie o QR Code ou copie a chave PIX para concluir o pagamento.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cartao" className="mt-6 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="card-name">Nome impresso no cartão</Label>
            <Input id="card-name" placeholder="Como aparece no cartão" className="border-gray-400 p-4" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="card-number">Número do cartão</Label>
            <Input id="card-number" placeholder="0000 0000 0000 0000" inputMode="numeric" className="border-gray-400 p-4" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-3 col-span-1">
              <Label htmlFor="card-exp">Validade</Label>
              <Input id="card-exp" placeholder="MM/AA" className="border-gray-400 p-4" />
            </div>
            <div className="space-y-3 col-span-1">
              <Label htmlFor="card-cvv">CVV</Label>
              <Input id="card-cvv" placeholder="123" className="border-gray-400 p-4" />
            </div>
            <div className="space-y-3 col-span-1">
              <Label htmlFor="card-parcelas" >Parcelas</Label>
              <select
                id="card-parcelas"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                {[1, 2, 3, 6, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}x de {(price / n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Lock className="h-3 w-3" /> Ambiente simulado — nenhum dado é cobrado ou armazenado.
          </p>
        </TabsContent>

        <TabsContent value="boleto" className="mt-6">
          <div className="rounded-lg border bg-muted/50 p-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Barcode className="h-4 w-4 text-primary" /> Boleto Bancário
            </div>
            <p className="text-muted-foreground">
              Após a confirmação, geraremos um boleto fictício no valor de{" "}
              <strong className="text-foreground">{formattedPrice}</strong> com vencimento em 3 dias úteis.
            </p>
            <div className="rounded bg-background border px-3 py-2 font-mono text-xs tracking-wider select-all break-all cursor-pointer">
              34191.79001 01043.510047 91020.150008 1 99990000019700
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        size="lg"
        onClick={onConfirm}
        className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold text-base h-12 cursor-pointer gap-2"
      >
        <CheckCircle2 className="h-5 w-5" />
        Confirmar Pagamento Simulado e Acessar Curso
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4 inline-flex items-center justify-center gap-1 w-full">
        <ShieldCheck className="h-3.5 w-3.5" /> Compra 100% simulada para fins acadêmicos.
      </p>
    </div>
  );
}