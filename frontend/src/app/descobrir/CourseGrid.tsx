"use client";

import CourseCard from "@/components/CourseCard";
import { formatName } from "@/utils/formatName";

interface CourseGridProps {
  courses: any[];
}

export default function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {courses.map((course) => {
        const rawProfessorName = course.professor_name || course.professor || "Instrutor";
        const formattedAuthor = formatName(rawProfessorName);

        return (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            author={formattedAuthor} 
            hours={Number(course.hours) || 0} 
            thumbnail={course.thumbnail} 
          />
        );
      })}
    </div>
  );
}