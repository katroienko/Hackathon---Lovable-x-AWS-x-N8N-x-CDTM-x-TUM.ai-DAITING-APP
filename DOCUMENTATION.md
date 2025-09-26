# 💕 AI-Powered Dating App with Voice Cloning

## 🌟 Overview / Обзор

**English:**
A modern dating application that combines traditional swiping with cutting-edge AI voice cloning technology. Users can clone their voice using ElevenLabs AI and use it for personalized text-to-speech in chat conversations, creating a more intimate and authentic communication experience.

**Russian:**
Современное приложение знакомств, которое сочетает традиционное листание карточек с передовой технологией клонирования голоса ИИ. Пользователи могут клонировать свой голос с помощью ElevenLabs AI и использовать его для персонализированного преобразования текста в речь в чат-разговорах, создавая более интимный и аутентичный опыт общения.

## ✨ Key Features / Ключевые возможности

### English:
- **🎤 Voice Cloning**: Record your voice and create a personalized AI voice model
- **💬 Voice Messages**: Send and receive messages with cloned voices
- **📱 Swipe Interface**: Traditional dating app swiping experience
- **💕 Smart Matching**: Algorithm-based user matching system
- **🔐 Secure Authentication**: JWT-based user authentication
- **📸 Photo Upload**: Multiple photo support for profiles
- **🎯 Preference Settings**: Age range and distance preferences
- **💌 Real-time Chat**: Instant messaging with voice integration

### Russian:
- **🎤 Клонирование голоса**: Записывайте свой голос и создавайте персонализированную ИИ-модель голоса
- **💬 Голосовые сообщения**: Отправляйте и получайте сообщения с клонированными голосами
- **📱 Интерфейс свайпа**: Традиционный опыт листания в приложениях знакомств
- **💕 Умный поиск пар**: Алгоритмическая система подбора пользователей
- **🔐 Безопасная аутентификация**: Аутентификация пользователей на основе JWT
- **📸 Загрузка фотографий**: Поддержка нескольких фотографий в профилях
- **🎯 Настройки предпочтений**: Предпочтения по возрасту и расстоянию
- **💌 Чат в реальном времени**: Мгновенные сообщения с интеграцией голоса

## 🛠 Technical Stack / Технический стек

### Frontend:
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React version with modern hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management for authentication

### Backend:
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **Socket.io** - Real-time communication
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling

### AI & Voice Technology:
- **ElevenLabs API** - AI voice cloning and text-to-speech
- **FFmpeg** - Audio processing and conversion
- **MediaRecorder API** - Browser-based voice recording

## 📋 Prerequisites / Предварительные требования

### English:
1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud instance)
3. **ElevenLabs API Key** (Pro subscription required for voice cloning)
4. **FFmpeg** installed on your system

### Russian:
1. **Node.js** (версия 18 или выше)
2. **MongoDB** (локальная или облачная установка)
3. **API-ключ ElevenLabs** (требуется Pro-подписка для клонирования голоса)
4. **FFmpeg** установленный в вашей системе

## 🚀 Installation / Установка

### English:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dating-app
   ```

2. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies (if separate)
   cd client && npm install
   ```

3. **Environment Setup:**
   Create `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dating-app
   JWT_SECRET=your-jwt-secret-key
   ELEVENLABS_API_KEY=your-elevenlabs-api-key
   PORT=8888
   ```

4. **Start the application:**
   ```bash
   # Start backend server
   npm run dev:server

   # In another terminal, start frontend
   npm run dev
   ```

### Russian:

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd dating-app
   ```

2. **Установите зависимости:**
   ```bash
   # Установите зависимости backend
   npm install

   # Установите зависимости frontend (если отдельно)
   cd client && npm install
   ```

3. **Настройка окружения:**
   Создайте файл `.env.local` в корневой директории:
   ```env
   MONGODB_URI=mongodb://localhost:27017/dating-app
   JWT_SECRET=ваш-jwt-секретный-ключ
   ELEVENLABS_API_KEY=ваш-elevenlabs-api-ключ
   PORT=8888
   ```

4. **Запустите приложение:**
   ```bash
   # Запустите backend сервер
   npm run dev:server

   # В другом терминале запустите frontend
   npm run dev
   ```

## 📖 Usage Guide / Руководство по использованию

### English:

#### 1. User Registration & Login
- Visit `http://localhost:3000`
- Create a new account or login with existing credentials
- Complete your profile with photos and personal information

#### 2. Voice Cloning Setup
1. Navigate to your **Profile** section
2. Scroll down to **Voice Cloning** section
3. Click **"Start Recording"**
4. Record for 30 seconds to 2 minutes:
   - Speak clearly and naturally
   - Use varied sentences and emotions
   - Record in a quiet environment
5. Enter a name for your voice
6. Click **"Create Voice Clone"**

**Note:** Voice cloning requires ElevenLabs Pro subscription

#### 3. Finding Matches
- Go to the **Swipe** section
- View user profiles and swipe:
  - **❤️ Right** - Like the person
  - **❌ Left** - Pass on the person
- When both users like each other, it's a match!

#### 4. Chatting with Matches
1. Go to **Matches** section
2. Select a match to start chatting
3. Send text messages or voice messages
4. Click the **🔊 speaker icon** to hear messages in the sender's voice
5. Hold the **🎤 microphone button** to record voice messages

### Russian:

#### 1. Регистрация и вход пользователя
- Перейдите на `http://localhost:3000`
- Создайте новую учетную запись или войдите с существующими учетными данными
- Заполните свой профиль фотографиями и личной информацией

#### 2. Настройка клонирования голоса
1. Перейдите в раздел **Профиль**
2. Прокрутите вниз до раздела **Клонирование голоса**
3. Нажмите **"Начать запись"**
4. Записывайте от 30 секунд до 2 минут:
   - Говорите четко и естественно
   - Используйте разнообразные предложения и эмоции
   - Записывайте в тихой обстановке
5. Введите имя для вашего голоса
6. Нажмите **"Создать клон голоса"**

**Примечание:** Клонирование голоса требует Pro-подписку ElevenLabs

#### 3. Поиск пар
- Перейдите в раздел **Свайп**
- Просматривайте профили пользователей и листайте:
  - **❤️ Вправо** - Нравится человек
  - **❌ Влево** - Пропустить человека
- Когда оба пользователя ставят лайк друг другу, это совпадение!

#### 4. Общение с парами
1. Перейдите в раздел **Пары**
2. Выберите пару для начала общения
3. Отправляйте текстовые или голосовые сообщения
4. Нажмите **🔊 иконку динамика**, чтобы услышать сообщения голосом отправителя
5. Удерживайте **🎤 кнопку микрофона** для записи голосовых сообщений

## 🏗 Project Structure / Структура проекта

```
dating-app/
├── src/                    # Frontend source code
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   │   ├── Profile.tsx    # User profile management
│   │   ├── SwipeCards.tsx # Swiping interface
│   │   ├── Chat.tsx       # Chat interface
│   │   ├── ChatList.tsx   # Matches list
│   │   └── VoiceRecorder.tsx # Voice cloning component
│   └── contexts/          # React contexts
│       └── AuthContext.tsx # Authentication context
├── server/                # Backend source code
│   ├── models/           # MongoDB models
│   │   └── User.js       # User model
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   ├── users.js      # User management routes
│   │   └── voice.js      # Voice cloning routes
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # JWT authentication
│   └── index.js          # Server entry point
├── uploads/              # File uploads directory
└── package.json          # Dependencies
```

## 🔧 API Endpoints / API-эндпоинты

### Authentication:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management:
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/potential-matches` - Get potential matches
- `POST /api/users/swipe` - Swipe action
- `GET /api/users/matches` - Get user matches

### Voice Cloning:
- `POST /api/voice/clone-voice` - Clone user voice
- `GET /api/voice/my-voice` - Get user's voice info
- `DELETE /api/voice/my-voice` - Delete custom voice
- `POST /api/voice/text-to-speech` - Convert text to speech

### Chat:
- `GET /api/chat/:userId` - Get chat history
- `POST /api/chat/send` - Send message

## 🎯 Technical Highlights / Технические особенности

### English:

#### Voice Cloning Implementation
1. **Browser Recording**: Uses MediaRecorder API to capture WebM audio
2. **Audio Conversion**: FFmpeg converts WebM to WAV (16kHz, mono, <10MB)
3. **ElevenLabs Integration**: Direct HTTP API calls for voice cloning
4. **Real-time Processing**: Instant voice message playback

#### Matching Algorithm
- Filters by age preferences, gender, and activity status
- Excludes previously swiped/matched users
- Smart pagination for optimal performance

#### Security Features
- JWT authentication with secure token storage
- File upload validation and size limits
- CORS protection and request rate limiting

### Russian:

#### Реализация клонирования голоса
1. **Запись в браузере**: Использует MediaRecorder API для захвата WebM аудио
2. **Конвертация аудио**: FFmpeg конвертирует WebM в WAV (16kHz, моно, <10MB)
3. **Интеграция ElevenLabs**: Прямые HTTP API-вызовы для клонирования голоса
4. **Обработка в реальном времени**: Мгновенное воспроизведение голосовых сообщений

#### Алгоритм подбора
- Фильтрация по предпочтениям возраста, пола и статуса активности
- Исключение ранее просмотренных/сопоставленных пользователей
- Умная пагинация для оптимальной производительности

#### Функции безопасности
- JWT-аутентификация с безопасным хранением токенов
- Валидация загрузки файлов и ограничения размера
- CORS-защита и ограничение скорости запросов

## ⚠️ Important Notes / Важные замечания

### English:
1. **ElevenLabs Subscription**: Voice cloning requires a Pro subscription to ElevenLabs
2. **File Size Limits**: Voice recordings are limited to 10MB after compression
3. **Recording Quality**: Record in a quiet environment for best voice cloning results
4. **Browser Compatibility**: Voice recording requires modern browser with MediaRecorder API support
5. **HTTPS Required**: Voice recording may require HTTPS in production

### Russian:
1. **Подписка ElevenLabs**: Клонирование голоса требует Pro-подписку на ElevenLabs
2. **Ограничения размера файлов**: Голосовые записи ограничены 10МБ после сжатия
3. **Качество записи**: Записывайте в тихой обстановке для лучших результатов клонирования голоса
4. **Совместимость браузеров**: Запись голоса требует современный браузер с поддержкой MediaRecorder API
5. **Требуется HTTPS**: Запись голоса может требовать HTTPS в продакшене

## 🚨 Troubleshooting / Решение проблем

### English:
- **No matches showing**: Check if users have `isActive` field set correctly
- **Voice cloning fails**: Verify ElevenLabs API key and subscription status
- **File upload errors**: Check file size and format restrictions
- **Database connection issues**: Verify MongoDB connection string

### Russian:
- **Не показываются совпадения**: Проверьте, правильно ли установлено поле `isActive` у пользователей
- **Клонирование голоса не работает**: Проверьте API-ключ ElevenLabs и статус подписки
- **Ошибки загрузки файлов**: Проверьте ограничения размера и формата файлов
- **Проблемы подключения к базе данных**: Проверьте строку подключения MongoDB

## 🔮 Future Enhancements / Будущие улучшения

### English:
- Real-time video calls with voice cloning
- Advanced matching algorithms with ML
- Multi-language voice support
- Voice-based profile verification
- Social media integration

### Russian:
- Видеозвонки в реальном времени с клонированием голоса
- Продвинутые алгоритмы подбора с ML
- Многоязыковая поддержка голоса
- Верификация профиля на основе голоса
- Интеграция с социальными сетями

## 📄 License / Лицензия

This project is licensed under the MIT License - see the LICENSE file for details.

Этот проект лицензирован под лицензией MIT - см. файл LICENSE для подробностей.

---

## 🤝 Contributing / Вклад в разработку

Feel free to submit issues and pull requests to improve the application.

Не стесняйтесь отправлять issues и pull requests для улучшения приложения.