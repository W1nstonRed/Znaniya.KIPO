# Backend endpoints

Все endpoints имеют префикс `/api`. Cookie сессии выставляет сервер:

- `auth_token` - access JWT, httpOnly
- `refresh_token` - refresh JWT, httpOnly

## Формат ошибки

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Некорректные данные запроса",
    "details": []
  },
  "meta": {
    "statusCode": 400,
    "path": "/api/auth/login",
    "timestamp": "2026-05-15T00:00:00.000Z"
  }
}
```

На front для уведомления можно брать `error.message`, для логики - `error.code`.

Общие ошибки: `VALIDATION_ERROR`, `AUTH_REQUIRED`, `ACCESS_TOKEN_EXPIRED`, `ACCESS_TOKEN_INVALID`, `REFRESH_TOKEN_MISSING`, `REFRESH_TOKEN_INVALID`, `SESSION_EXPIRED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_SERVER_ERROR`.

## Auth

### POST `/api/auth/login`

Body:

```json
{
  "username": "student1",
  "password": "secret123"
}
```

Response `200`:

```json
{
  "id": "user-id",
  "username": "student1",
  "fullName": "Иванов Иван",
  "role": "STUDENT",
  "isAuthenticated": true,
  "groupId": "group-id",
  "studentId": "student-id",
  "accessToken": "jwt",
  "refreshToken": "jwt"
}
```

Ошибки: `INVALID_CREDENTIALS`, `VALIDATION_ERROR`.

### POST `/api/auth/register`

Регистрация без invite-token. Если запись студента/преподавателя уже есть, аккаунт привяжется к ней. Если нет - будет создана запись `Student` или `Teacher`.

Body для студента:

```json
{
  "username": "student1",
  "password": "secret123",
  "role": "STUDENT",
  "fullName": "Иванов Иван Иванович",
  "groupId": "group-id"
}
```

Body для преподавателя:

```json
{
  "username": "teacher1",
  "password": "secret123",
  "role": "TEACHER",
  "fullName": "Петров Петр Петрович"
}
```

Response `201`: как `/auth/login`.

Ошибки: `USERNAME_TAKEN`, `REGISTRATION_PERSON_REQUIRED`, `GROUP_NOT_FOUND`, `STUDENT_ALREADY_LINKED`, `TEACHER_ALREADY_LINKED`, `VALIDATION_ERROR`.

### POST `/api/auth/refresh`

Body не нужен. Сервер читает `refresh_token` cookie и выставляет новые cookies.

Response `200`: как `/auth/login`.

Ошибки: `REFRESH_TOKEN_MISSING`, `REFRESH_TOKEN_INVALID`, `SESSION_EXPIRED`.

### POST `/api/auth/logout`

Response `200`:

```json
{ "ok": true }
```

### GET `/api/auth/me`

Если `auth_token` истек, сервер пробует обновить сессию через `refresh_token` cookie и выставляет новый `auth_token`.

Response `200`:

```json
{
  "id": "user-id",
  "username": "student1",
  "fullName": "Иванов Иван",
  "role": "STUDENT",
  "isAuthenticated": true,
  "groupId": "group-id",
  "studentId": "student-id"
}
```

Если сессии нет:

```json
{ "user": null }
```

## Push

Все endpoints требуют авторизацию.

### POST `/api/push/subscribe`

Body:

```json
{
  "endpoint": "https://push-service/subscription",
  "keys": {
    "p256dh": "key",
    "auth": "auth"
  }
}
```

Response:

```json
{ "ok": true }
```

Ошибки: `AUTH_REQUIRED`, `VALIDATION_ERROR`.

### POST `/api/push/unsubscribe`

Body:

```json
{ "endpoint": "https://push-service/subscription" }
```

Response:

```json
{ "ok": true }
```

### POST `/api/push/test`

Отправляет тестовое push-уведомление всем подпискам.

Response:

```json
{ "ok": true }
```

## Notifications

Все endpoints требуют авторизацию.

### GET `/api/notifications`

Response:

```json
[
  {
    "id": "notification-id",
    "type": "schedule_change",
    "title": "Изменение в расписании",
    "body": "Текст",
    "read": false,
    "data": {},
    "createdAt": "2026-05-15T00:00:00.000Z"
  }
]
```

### GET `/api/notifications/unread-count`

Response:

```json
{ "count": 3 }
```

### PATCH `/api/notifications/:id/read`

Response:

```json
{ "updated": 1 }
```

Ошибки: `NOTIFICATION_NOT_FOUND`.

### PATCH `/api/notifications/read-all`

Response:

```json
{ "updated": 3 }
```

## Schedule

### GET `/api/schedule/groups`

Синхронизирует группы расписания при пустом кеше. Каждая внешняя группа привязана к `Group`.

Response:

```json
[
  {
    "id": 123,
    "name": "25-ИС",
    "normalizedName": "25-ис",
    "groupId": "group-id",
    "group": { "id": "group-id", "name": "25-ИС" }
  }
]
```

Ошибки: `SCHEDULE_SOURCE_UNAVAILABLE`.

### GET `/api/schedule/teachers`

Синхронизирует преподавателей. Варианты `Фамилия`, `Фамилия*`, `Фамилия**` получают разные external id, но один `teacherId`.

Response:

```json
[
  {
    "id": 10,
    "fio": "Петров",
    "normalizedFio": "петров",
    "teacherId": "teacher-id",
    "teacher": { "id": "teacher-id", "fullName": "Петров" }
  }
]
```

### POST `/api/schedule/group`

Body:

```json
{
  "groupId": 123,
  "date": "2026-05-15"
}
```

Response: расписание внешнего API. При запросе backend сохраняет группы, предметы, преподавателей, кабинеты и занятия.

Ошибки: `SCHEDULE_SOURCE_UNAVAILABLE`, `INVALID_DATE`.

### POST `/api/schedule/teacher`

Body:

```json
{
  "teacherId": 10,
  "date": "2026-05-15"
}
```

Response:

```json
{
  "teacher": { "id": "teacher-id", "fullName": "Петров" },
  "externalTeacherIds": [10, 11, 12],
  "schedules": [
    {
      "externalTeacherId": 10,
      "fio": "Петров",
      "schedule": {}
    }
  ]
}
```

### GET `/api/schedule/free-cabinets?date=2026-05-15&lesson=2&building=1`

Response:

```json
{
  "free": [{ "id": "cabinet-id", "name": "101" }],
  "busy": [{ "id": "cabinet-id", "name": "102" }]
}
```

### GET `/api/schedule/favorites`

Требует авторизацию.

Response:

```json
{
  "groups": [],
  "teachers": []
}
```

### POST `/api/schedule/favorites`

Требует авторизацию.

Body:

```json
{ "externalGroupId": 123 }
```

или:

```json
{ "externalTeacherId": 10 }
```

Response: созданное избранное.

Ошибки: `SCHEDULE_FAVORITE_TARGET_REQUIRED`, `SCHEDULE_GROUP_NOT_FOUND`, `SCHEDULE_TEACHER_NOT_FOUND`.

### DELETE `/api/schedule/favorites/:id`

Response:

```json
{ "deleted": 1 }
```

## Specializations

### GET `/api/specializations`

Response:

```json
[
  {
    "id": "specialty-id",
    "name": "Юриспруденция",
    "iconName": "scale",
    "animationUrl": null,
    "groups": []
  }
]
```

### GET `/api/specializations/:id`

Response: одна специальность.

Ошибки: `NOT_FOUND`.

### POST `/api/specializations`

Только `ADMIN`.

Body:

```json
{
  "name": "Юриспруденция",
  "iconName": "scale",
  "animationUrl": "https://example.com/icon.json"
}
```

Response: созданная специальность.

Ошибки: `FORBIDDEN`, `CONFLICT`, `VALIDATION_ERROR`.

### PATCH `/api/specializations/:id`

Только `ADMIN`. Body: частичный объект как в POST.

### DELETE `/api/specializations/:id`

Только `ADMIN`.

## Groups

### GET `/api/groups`

Response:

```json
[
  {
    "id": "group-id",
    "name": "25-ИС",
    "normalizedName": "25-ис",
    "isActive": true,
    "specialty": {},
    "curatorTeacher": {},
    "_count": { "students": 20, "lessons": 10 }
  }
]
```

### GET `/api/groups/:id`

Response: группа со студентами.

Ошибки: `GROUP_NOT_FOUND`.

### POST `/api/groups`

Только `ADMIN`.

Body:

```json
{
  "name": "25-ИС",
  "specialtyId": "specialty-id",
  "curatorTeacherId": "teacher-id",
  "curatorAdminId": "user-id",
  "isActive": true
}
```

Response: созданная группа.

Ошибки: `GROUP_ALREADY_EXISTS`, `FORBIDDEN`.

### PATCH `/api/groups/:id`

Только `ADMIN`. Body: частичный объект как в POST.

### DELETE `/api/groups/:id`

Только `ADMIN`.

Response:

```json
{ "deleted": true }
```

### PATCH `/api/groups/:id/favorite`

Любая авторизованная роль.

Response:

```json
{ "isFavorite": true }
```

### POST `/api/groups/:id/notify`

`ADMIN` или `TEACHER`. Отправляет in-app и push студентам группы и куратору.

Body:

```json
{
  "title": "Практика",
  "body": "Завтра принести тетради"
}
```

Response:

```json
{ "count": 21 }
```

## Students

### GET `/api/students?groupId=group-id`

Response:

```json
[
  {
    "id": "student-id",
    "fullName": "Иванов Иван",
    "groupId": "group-id",
    "userId": null
  }
]
```

### GET `/api/students/:id`

Response: студент с группой и оценками.

Ошибки: `STUDENT_NOT_FOUND`.

### POST `/api/students`

Только `ADMIN`.

Body:

```json
{
  "fullName": "Иванов Иван",
  "groupId": "group-id"
}
```

Ошибки: `STUDENT_ALREADY_EXISTS`, `FORBIDDEN`.

### PATCH `/api/students/:id`

Только `ADMIN`. Body: `fullName`, `groupId`, `userId`.

### DELETE `/api/students/:id`

Только `ADMIN`.

## Cabinets

### GET `/api/cabinets`

Response: список кабинетов.

### POST `/api/cabinets`

Только `ADMIN`.

Body:

```json
{
  "name": "101",
  "shortName": "101",
  "building": "1",
  "floor": 1,
  "ignore": false
}
```

Ошибки: `FORBIDDEN`, `CONFLICT`.

### PATCH `/api/cabinets/:id`

Только `ADMIN`.

### DELETE `/api/cabinets/:id`

Только `ADMIN`.

### POST `/api/cabinets/import-from-schedule`

Только `ADMIN`.

Body:

```json
{ "names": ["101", "102"] }
```

## Journal

### GET `/api/journal/groups/:groupId`

Публичный просмотр журнала группы.

Response:

```json
{
  "id": "group-id",
  "name": "25-ИС",
  "students": [],
  "lessons": [
    {
      "id": "lesson-id",
      "date": "2026-05-15T00:00:00.000Z",
      "lessonNumber": 2,
      "topic": "Тема занятия",
      "description": "Описание",
      "subject": {},
      "teacher": {},
      "cabinet": {},
      "grades": [],
      "materials": []
    }
  ]
}
```

Ошибки: `GROUP_NOT_FOUND`.

### PATCH `/api/journal/lessons/:id`

`ADMIN` или `TEACHER`.

Body:

```json
{
  "topic": "Новая тема",
  "description": "Что делали на занятии",
  "lessonPlanTopicId": "ktp-topic-id"
}
```

Ошибки: `LESSON_NOT_FOUND`.

### POST `/api/journal/lessons/:id/grades`

`ADMIN` или `TEACHER`.

Body:

```json
{
  "studentId": "student-id",
  "value": 5,
  "comment": "Отличная работа"
}
```

Response: созданная или обновленная оценка.

### POST `/api/journal/grades/:id/comments`

Любой авторизованный пользователь.

Body:

```json
{ "text": "Комментарий" }
```

Ошибки: `GRADE_NOT_FOUND`.

### POST `/api/journal/lesson-plans`

`ADMIN` или `TEACHER`. Создает КТП-метаданные и темы.

Body:

```json
{
  "title": "КТП по математике",
  "groupId": "group-id",
  "subjectId": "subject-id",
  "teacherId": "teacher-id",
  "fileId": "file-id",
  "topics": [
    { "order": 1, "title": "Введение" }
  ]
}
```

### POST `/api/journal/lessons/:id/materials`

`ADMIN` или `TEACHER`. Прикрепляет уже созданный файл к занятию.

Body:

```json
{ "fileId": "file-id" }
```

Ошибки: `LESSON_NOT_FOUND`, `FILE_NOT_FOUND`, `FILE_FORBIDDEN`.

## Files

Все endpoints требуют авторизацию. Сейчас endpoint создает запись о файле и путь хранения; multipart-upload можно подключить поверх этой модели.

### GET `/api/files`

Response: свои файлы, публичные файлы и файлы, которыми поделились с пользователем или его группой.

### GET `/api/files/:id`

Response: файл.

Ошибки: `FILE_NOT_FOUND`.

### POST `/api/files`

Body:

```json
{
  "name": "lecture.pdf",
  "originalName": "lecture.pdf",
  "mimeType": "application/pdf",
  "sizeBytes": 123456,
  "storagePath": "/uploads/user-id/lecture.pdf",
  "visibility": "PRIVATE",
  "lessonId": "lesson-id"
}
```

Response: созданный файл.

### POST `/api/files/:id/share`

Body:

```json
{ "targetUserId": "user-id" }
```

или:

```json
{ "targetGroupId": "group-id" }
```

Response: запись шаринга.

Ошибки: `FILE_SHARE_TARGET_REQUIRED`, `FILE_NOT_FOUND`, `FILE_FORBIDDEN`.

### DELETE `/api/files/:id`

Response:

```json
{ "deleted": true }
```

## Tests

Все endpoints требуют авторизацию.

### GET `/api/tests`

Для `ADMIN` возвращает все тесты, для `TEACHER` - созданные им, для `STUDENT` - назначенные его группе.

### GET `/api/tests/:id`

Response: тест с вопросами, вариантами и группами.

Ошибки: `TEST_NOT_FOUND`.

### POST `/api/tests`

`ADMIN` или `TEACHER`.

Body:

```json
{
  "title": "Тест по теме 1",
  "description": "Описание",
  "subjectId": "subject-id",
  "deadline": "2026-05-30T23:59:00.000Z",
  "maxAttempts": 1,
  "isGrade": true,
  "gradeLessonId": "lesson-id",
  "groupIds": ["group-id"],
  "questions": [
    {
      "type": "SINGLE_CHOICE",
      "order": 1,
      "text": "2 + 2?",
      "points": 1,
      "options": [
        { "order": 1, "text": "3", "isCorrect": false },
        { "order": 2, "text": "4", "isCorrect": true }
      ]
    },
    {
      "type": "TEXT",
      "order": 2,
      "text": "Столица России?",
      "points": 1,
      "textAnswer": "Москва",
      "minMatchPercent": 80
    }
  ]
}
```

Response: созданный тест.

### POST `/api/tests/:id/assign-groups`

`ADMIN` или `TEACHER`.

Body:

```json
{ "groupIds": ["group-id"] }
```

### POST `/api/tests/:id/attempts`

Только студент.

Response:

```json
{
  "id": "attempt-id",
  "testId": "test-id",
  "status": "IN_PROGRESS",
  "startedAt": "2026-05-15T00:00:00.000Z"
}
```

Ошибки: `TEST_STUDENT_REQUIRED`, `TEST_DEADLINE_EXPIRED`, `TEST_NOT_ASSIGNED`, `TEST_ATTEMPTS_EXCEEDED`.

### POST `/api/tests/attempts/:id/submit`

Body:

```json
{
  "answers": [
    {
      "questionId": "question-id",
      "selectedOptionIds": ["option-id"]
    },
    {
      "questionId": "question-id-2",
      "textAnswer": "Москва"
    }
  ]
}
```

Response: попытка со статусом `GRADED`, баллами и ответами. Если `isGrade=true`, оценка автоматически добавляется в журнал.

Ошибки: `TEST_ATTEMPT_NOT_FOUND`, `TEST_ATTEMPT_FORBIDDEN`, `TEST_ATTEMPT_ALREADY_SUBMITTED`.

### POST `/api/tests/attempts/:id/proctor-events`

Вызывать с front при `visibilitychange`, `blur`, выходе из fullscreen, copy/paste и т.д.

Body:

```json
{
  "type": "WINDOW_BLUR",
  "payload": { "at": 12345 }
}
```

Возможные `type`: `PAGE_HIDDEN`, `PAGE_VISIBLE`, `WINDOW_BLUR`, `WINDOW_FOCUS`, `FULLSCREEN_EXIT`, `COPY`, `PASTE`, `CUSTOM`.

Response: созданное событие.
