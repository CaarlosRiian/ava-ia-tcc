"use client";

import LessonComments from "../_components/LessonComments";
import Tabs, { TabItem } from "../_components/tabs/Tabs";
import LessonLearningTools from "../_components/tabs/LessonLearningTools";
import LessonOverview, { LessonOverviewProps } from "./LessonOverView";
import CourseReviews from "../_components/tabs/CourseReviews";

export type LessonContentProps = LessonOverviewProps;

export default function LessonContent(props: LessonContentProps) {
  const { lesson, course, setAiOpen } = props; 
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const courseId = course?.id || lesson.course_id || lesson.course;

  const tabs: TabItem[] = [
    { id: "overview", label: "Visão geral", content: <LessonOverview {...props} /> },
    {
      id: "qa",
      label: "Comentários",
      content: (
        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:p-0 [&>div]:mt-0">
          <LessonComments lessonId={lesson.id} apiBaseUrl={apiBaseUrl} />
        </div>
      ),
    },
    { id: "reviews", label: "Avaliações", content: <CourseReviews courseId={Number(courseId)} /> },
    {
      id: "tools",
      label: "Ferramentas de aprendizado",
      content: <LessonLearningTools lessonTitle={lesson.title} setAiOpen={setAiOpen} />,
    },
  ];

  return (
    <section className="w-full bg-white">
      <Tabs tabs={tabs} ariaLabel="Seções da aula" />
    </section>
  );
}