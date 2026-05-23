"use client";

interface OrderSummaryProps {
  title: string;
  author?: string;
  formattedPrice: string;
}

export default function OrderSummary({ title, author, formattedPrice }: OrderSummaryProps) {
  return (
    <aside className="lg:col-span-1">
      <div className="rounded-2xl border bg-card shadow-sm p-6 sticky top-20">
        <h2 className="font-semibold mb-4">Resumo do pedido</h2>
        <div className="space-y-1 pb-4 border-b">
          <p className="text-sm font-medium leading-snug">{title}</p>
          {author && <p className="text-xs text-muted-foreground">por {author}</p>}
        </div>
        <div className="py-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formattedPrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Desconto</span>
            <span className="text-green-600">- R$ 0,00</span>
          </div>
        </div>
        <div className="pt-4 border-t flex justify-between items-center">
          <span className="font-semibold">Total</span>
          <span className="text-2xl font-bold">{formattedPrice}</span>
        </div>
      </div>
    </aside>
  );
}