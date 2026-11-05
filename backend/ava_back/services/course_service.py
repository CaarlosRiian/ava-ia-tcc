from django.db.models import Q

class CourseService:
    @staticmethod
    def get_recommended_courses(user):
        from ..models import Course

        queryset = Course.objects.filter(published=True)

        user_age = getattr(user, 'age', None)
        user_interests = getattr(user, 'interests', []) or []

        if not user_age and not user_interests:
            return queryset.order_by('-created_at')[:10]

        query = Q()
        if user_interests:
            query &= (Q(target_area__in=user_interests) | Q(category__name__in=user_interests))

        if user_age is not None:
            query &= Q(min_age__lte=user_age, max_age__gte=user_age)

        return queryset.filter(query).distinct().order_by('-created_at')