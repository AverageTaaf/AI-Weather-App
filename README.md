# SchedulePro - Task Management System

A professional, feature-rich task management web application with Firebase integration, multiple view layouts, and comprehensive productivity analytics.

![SchedulePro](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks with detailed metadata
- **Multiple View Layouts**: Kanban, List, Grid, Timeline, and Calendar views
- **Drag & Drop**: Intuitive task movement between status columns
- **Firebase Integration**: Real-time cloud sync and authentication
- **User Authentication**: Email/password and Google OAuth support
- **Offline Support**: Local storage fallback when not authenticated

### Task Features
- **Rich Task Details**:
  - Title and description
  - Due dates and time ranges
  - Difficulty levels (Easy, Medium, Hard)
  - Importance ratings (Low, Medium, High)
  - Custom tags and categories
  - Checkpoints/sub-tasks with progress tracking
  - Recurring tasks (Daily, Weekly, Monthly)
  - Reminder notifications

### Organization & Filtering
- **Advanced Search**: Real-time search across task titles and descriptions
- **Multi-criteria Filtering**: Filter by date range, status, difficulty, and importance
- **Tag Management**: Create and manage custom tags with color coding
- **Sorting Options**: Sort by date, importance, progress, or due date
- **Bulk Actions**: Select and modify multiple tasks simultaneously

### Views & Visualization
- **Kanban Board**: Three-column workflow (To-Do, In Progress, Done)
- **List View**: Compact linear task list
- **Grid View**: Card-based responsive grid layout
- **Timeline View**: Chronological task timeline
- **Calendar View**: Monthly calendar with task visualization
- **Density Modes**: Relaxed or Compact spacing options

### Analytics & Insights
- **Dashboard Statistics**: Total tasks, completed, in progress, overdue counts
- **Progress Tracking**: Overall completion percentage
- **Visual Charts**: 
  - Task completion trends
  - Status distribution
  - Weekly productivity metrics

### UI/UX Features
- **6 Theme Options**: Light, Dark, Blue, Green, Pink, Orange
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Polished transitions and interactions
- **Keyboard Shortcuts**: Quick access to common actions
- **Collapsible Sections**: Minimize/maximize form and analytics
- **Archive System**: Archive completed tasks for later reference
- **Trash/Restore**: Soft delete with recovery option

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication)
- **Charts**: Chart.js
- **Icons**: Font Awesome 6.4.0
- **Storage**: LocalStorage (offline fallback)

## 📦 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for Firebase features)

### Setup

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/AverageTaaf/schedulepro.git
   cd schedulepro
   ```

2. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     ```

3. **Access the application**
   - Navigate to `http://localhost:8000` (if using local server)
   - Or directly open `index.html` in your browser

### Firebase Configuration (Optional)

The app comes pre-configured with Firebase. To use your own Firebase project:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database and Authentication
3. Update the Firebase configuration in `script.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     // ... other config
   };
   ```

## 📖 Usage Guide

### Getting Started

1. **First Launch**: Complete the onboarding tutorial (if enabled)
2. **Choose Theme**: Select your preferred color theme from the header
3. **Select View**: Pick your favorite layout (Kanban recommended for beginners)
4. **Create Account** (Optional): Sign up for cloud sync across devices

### Creating Tasks

1. Fill in the task form with:
   - **Title** (required)
   - **Description** (optional)
   - **Due Date & Time**
   - **Difficulty Level**
   - **Importance Rating**
   - **Checkpoints** (one per line)
   - **Tags** for organization
   - **Reminder** settings

2. Click **Add Task** button

### Managing Tasks

- **Edit**: Click on any task card to open the edit modal
- **Move**: Drag tasks between columns (Kanban view)
- **Complete**: Click the complete button or move to "Done" column
- **Delete**: Click delete button (moves to trash)
- **Archive**: Archive completed tasks for cleanup

### Keyboard Shortcuts

- `Ctrl + F`: Focus search bar
- `Ctrl + N`: New task (focus form)
- `Ctrl + S`: Save current task
- `Esc`: Close modal/cancel action
- `Ctrl + E`: Export tasks
- `Ctrl + H`: Open help modal

### Advanced Features

#### Bulk Actions
1. Click "Bulk Select" button
2. Check tasks you want to modify
3. Click "Bulk Actions" and choose operation

#### Advanced Filters
1. Click "Advanced Filters" button
2. Set date ranges, status, difficulty, importance
3. Click "Apply Filters"

#### Export/Import
- **Export**: Download tasks as JSON file
- **Import**: Upload previously exported JSON file

## 🎨 Themes

Choose from 6 beautiful themes:
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes for nighttime
- **Blue**: Ocean-inspired calming colors
- **Green**: Nature-themed refreshing palette
- **Pink**: Vibrant and energetic
- **Orange**: Warm and motivating

## 📱 Browser Support

- Chrome/Edge: ✅ Fully supported
- Firefox: ✅ Fully supported
- Safari: ✅ Fully supported
- Opera: ✅ Fully supported
- IE11: ❌ Not supported

## 🔒 Privacy & Security

- All data stored in Firebase is associated with your user account
- Passwords are securely hashed by Firebase Authentication
- Local storage is used only when not authenticated
- No third-party tracking or analytics

## 🐛 Known Issues

- Calendar view may not display correctly on very small screens (<320px)
- Drag and drop not available on touch devices in some browsers
- Chart animations may lag on older devices

## 🚧 Roadmap

- [ ] Mobile app (React Native)
- [ ] Team collaboration features
- [ ] Task templates
- [ ] Email notifications
- [ ] Integration with Google Calendar
- [ ] Dark mode auto-switch based on time
- [ ] Task dependencies
- [ ] Gantt chart view

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👤 Author

**Taafeef Bin Montaquim**
- Email: montaquim.tbm@gmail.com
- GitHub: [@AverageTaaf](https://github.com/AverageTaaf)

## 🙏 Acknowledgments

- Font Awesome for the icon library
- Chart.js for beautiful charts
- Firebase for backend infrastructure
- All contributors and users of SchedulePro

## 📞 Support

For support, email montaquim.tbm@gmail.com or open an issue on GitHub.

---

**Made with ❤️ by Taafeef Bin Montaquim**
