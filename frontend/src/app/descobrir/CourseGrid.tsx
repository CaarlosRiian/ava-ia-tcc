import CourseCard from "./CourseCard";

interface Course {
  id: number | string;
  title: string;
  author: string;
  hours: number;
}

export default function CourseGrid({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          title={course.title}
          author={course.author}
          hours={course.hours}
        />
      ))}
    </div>
  );
}