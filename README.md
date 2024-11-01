# Alvarado Bit Service Website

A modern, responsive website for Alvarado Bit Service, featuring company information, contact forms, and an administrative dashboard for managing customer inquiries.

## 🚀 Features

- Responsive design optimized for all devices
- Video hero section showcasing drilling operations
- Contact form with Supabase backend integration
- Secure admin dashboard for managing form submissions
- Real-time submission status tracking
- Advanced filtering and sorting of customer inquiries

## 🛠️ Built With

- [Vue 3](https://vuejs.org/) - The Progressive JavaScript Framework
- [Vue Router](https://router.vuejs.org/) - Official router for Vue.js
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- Custom CSS with CSS Variables for theming
- Responsive design with mobile-first approach

## 📋 Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/alvarado-bit-service.git
```

2. Navigate to the project directory:

```bash
cd alvarado-bit-service
```

3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Start the development server:

```bash
npm run dev
```

## 🏗️ Project Structure

```
alvarado-bit-service/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, and global styles
│   ├── components/     # Vue components
│   ├── lib/           # Utilities and configurations
│   ├── router/        # Vue Router configuration
│   ├── views/         # Page components
│   ├── App.vue        # Root component
│   └── main.js        # Application entry point
├── .env               # Environment variables
└── index.html         # HTML entry point
```

## 🌐 Pages

- **Home**: Company overview with video hero section
- **About**: Company history and services
- **Contact**: Contact form with real-time submission
- **Admin**: Secure dashboard for managing submissions

## 🔐 Admin Dashboard

The admin dashboard provides:

- Real-time form submission monitoring
- Status tracking (New, In Progress, Completed, Archived)
- Advanced filtering and sorting options
- Responsive design for mobile access

## 💾 Database Schema

### Contact Submissions Table

```sql
create table contact_submissions (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text default 'new'::text
);
```

## 🚀 Deployment

1. Build the project:

```bash
npm run build
```

2. Deploy the `dist` directory to your hosting provider

## 🔧 Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. Unauthorized copying or distribution of this project's files, via any medium, is strictly prohibited.
