"use client";

import { Star } from "lucide-react";
import TabEmptyState from "./TabEmptyState";

export default function LessonReviews() {
  return (
    <TabEmptyState
      icon={<Star size={22} />}
      title="Ainda não há avaliações"
      description="As avaliações dos alunos sobre este curso serão exibidas aqui."
    />
  );
}