import { PlayCircle, Lock, Video } from "lucide-react";

interface CourseModulesProps {
  modules: any[];
}

export default function CourseModules({ modules }: CourseModulesProps) {

  if (!modules || modules.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Conteúdo do curso</h2>
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          Nenhum módulo listado para este curso ainda no Django.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Conteúdo do curso</h2>

      <div className="space-y-4">
        {modules.map((mod: any, i: number) => {
          const moduleTitle = mod.title || mod.name || mod.nome || `Módulo ${i + 1}`;

          const lessons = mod.lessons || mod.aulas || [];
          const lessonsCount = lessons.length || mod.lessons_count || 0;

          return (
            <div key={mod.id || i} className="rounded-xl border bg-card overflow-hidden shadow-sm">

              <div className="flex items-center justify-between p-4 bg-muted/40 border-b">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm md:text-base truncate">{moduleTitle}</p>
                    <p className="text-xs text-muted-foreground">{lessonsCount} {lessonsCount === 1 ? 'aula' : 'aulas'}</p>
                  </div>
                </div>
                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>

              {lessons.length > 0 ? (
                <div className="divide-y bg-background/50">
                  {lessons.map((lesson: any, j: number) => {
                    const lessonTitle = lesson.title || lesson.name || lesson.nome || `Aula ${j + 1}`;

                    return (
                      <div
                        key={lesson.id || j}
                        className="flex items-center justify-between px-6 py-3 hover:bg-accent/30 transition-colors text-sm pl-12"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                          <p className="text-muted-foreground truncate font-medium">{lessonTitle}</p>
                        </div>

                        {lesson.duration && (
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {lesson.duration}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-6 py-3 text-xs text-muted-foreground italic pl-12 bg-background/20">
                  Nenhuma aula cadastrada neste módulo.
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground bg-muted/30 border border-dashed p-3 rounded-lg">
        <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span>Adquira o curso para ter acesso a todas as aulas.</span>
      </div>
    </section>
  );
}