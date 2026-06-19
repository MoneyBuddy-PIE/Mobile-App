import { Stack } from "expo-router";

export default function CoursesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[chapterId]" />
            <Stack.Screen name="child-categories" />
            <Stack.Screen name="child-chapters/chapter-list" />
            <Stack.Screen name="child-chapters/courses/course-map" />
            <Stack.Screen name="courses/[courseId]" />
        </Stack>
    );
}
