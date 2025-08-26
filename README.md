# Smart Todo - Learning Tracker Web App

A modern, feature-rich todo application with integrated daily learning checklist and progress tracking. Perfect for personal productivity and continuous learning.

## 🌟 Features

### 📝 Smart Todo Management
- **Task Creation & Management**: Add, edit, and delete tasks with descriptions
- **Priority Levels**: High, Medium, Low priority classification
- **Due Dates**: Set and track task deadlines
- **Smart Filtering**: Filter by All, Pending, Completed, or Priority tasks
- **Auto-sorting**: Tasks sorted by priority and creation date

### 🎓 Daily Learning Checklist
- **Learning Goals**: Create daily learning objectives with categories
- **Comments & Notes**: Add detailed notes and resources for each learning item
- **Category Organization**: Programming, Design, Business, Language, and Other categories
- **Daily Rollover**: Learning items automatically carry over to new days
- **Progress Tracking**: Track completion status and learning streaks

### 📊 Progress Analytics
- **Weekly Progress Charts**: Visual representation of daily completion rates
- **Learning Category Analysis**: Track progress across different learning areas
- **Streak Tracking**: Monitor consecutive days of activity
- **Statistics Dashboard**: Today's completed items, weekly totals, and streak days
- **Historical Data**: Navigate through past weeks to review progress

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Smooth Animations**: Elegant transitions and hover effects
- **Intuitive Interface**: Clean, modern design with excellent usability
- **Accessibility**: Keyboard navigation and screen reader friendly

### 💾 Data Management
- **Local Storage**: All data stored locally in browser
- **Data Export**: Export all data as JSON for backup
- **Sample Data**: Pre-loaded sample tasks and learning items
- **Persistent Settings**: Theme preferences and user settings saved

## 🚀 Quick Start

### Local Development
1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Start Using** - The app works immediately with sample data

### Hosting on Hostinger

#### Option 1: Direct Upload (Recommended)
1. **Login** to your Hostinger control panel
2. **Navigate** to File Manager or use FTP
3. **Upload** all project files to your `public_html` folder:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
4. **Access** your app at `yourdomain.com`

#### Option 2: Using Hostinger's Website Builder
1. **Create** a new website in Hostinger's Website Builder
2. **Upload** the files to the custom HTML section
3. **Publish** your website

#### Option 3: Using cPanel
1. **Access** cPanel from your Hostinger dashboard
2. **Open** File Manager
3. **Navigate** to `public_html`
4. **Upload** all project files
5. **Set permissions** to 644 for files and 755 for directories

## 📁 File Structure

```
smart-todo-app/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # Documentation
```

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern structure
- **CSS3**: Flexbox, Grid, CSS Variables, and responsive design
- **Vanilla JavaScript**: ES6+ features, classes, and modern APIs
- **Local Storage**: Client-side data persistence
- **Font Awesome**: Icons for better UX
- **Google Fonts**: Inter font family for modern typography

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features
- **Lightweight**: No external dependencies except CDN resources
- **Fast Loading**: Optimized CSS and JavaScript
- **Offline Capable**: Works without internet connection
- **Memory Efficient**: Minimal memory footprint

## 📱 Mobile Responsiveness

The app is fully responsive and optimized for:
- **Desktop**: 1200px+ screens with full feature access
- **Tablet**: 768px-1199px with adapted layout
- **Mobile**: 320px-767px with mobile-first design
- **Touch Friendly**: Optimized for touch interactions

## 🎯 Use Cases

### For Students
- Track daily study goals
- Monitor learning progress across subjects
- Maintain study streaks and motivation

### For Professionals
- Manage work tasks and projects
- Track skill development and training
- Monitor productivity and completion rates

### For Personal Development
- Set and track personal goals
- Monitor habit formation
- Track learning new skills or languages

## 🔧 Customization

### Adding New Categories
Edit the `learning-category` select options in `index.html`:
```html
<select id="learning-category">
    <option value="programming">Programming</option>
    <option value="design">Design</option>
    <option value="business">Business</option>
    <option value="language">Language</option>
    <option value="fitness">Fitness</option>  <!-- Add new category -->
    <option value="other">Other</option>
</select>
```

### Changing Colors
Modify CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;    /* Change primary color */
    --success-color: #10b981;    /* Change success color */
    /* ... other variables */
}
```

### Adding New Features
The modular JavaScript structure makes it easy to add new features:
- Add new methods to the `SmartTodoApp` class
- Extend the UI in `index.html`
- Style new elements in `styles.css`

## 📊 Data Structure

### Todo Items
```javascript
{
    id: "unique_id",
    title: "Task title",
    description: "Task description",
    priority: "high|medium|low",
    dueDate: "YYYY-MM-DD",
    completed: false,
    createdAt: "ISO date string",
    completedAt: "ISO date string" // Only when completed
}
```

### Learning Items
```javascript
{
    id: "unique_id",
    title: "Learning topic",
    category: "programming|design|business|language|other",
    notes: "Learning notes and resources",
    completed: false,
    createdAt: "ISO date string",
    completedAt: "ISO date string" // Only when completed
}
```

## 🔒 Privacy & Security

- **No Server Required**: All data stored locally in your browser
- **No Data Collection**: No analytics or tracking
- **Export Control**: You control your data export
- **Browser Privacy**: Respects browser privacy settings

## 🆘 Troubleshooting

### Common Issues

**App not loading properly**
- Check if all files are uploaded correctly
- Ensure file permissions are set correctly (644 for files, 755 for directories)
- Clear browser cache and reload

**Data not saving**
- Check if localStorage is enabled in your browser
- Try in incognito/private mode
- Check browser console for errors

**Styling issues**
- Ensure `styles.css` is properly linked
- Check if Font Awesome CDN is accessible
- Verify Google Fonts are loading

### Browser Console Errors
If you see errors in the browser console:
1. **Check file paths** - Ensure all files are in the same directory
2. **Verify file names** - Case-sensitive file names matter
3. **Check CDN resources** - Font Awesome and Google Fonts should load

## 🚀 Future Enhancements

Potential features for future versions:
- **Cloud Sync**: Sync data across devices
- **Collaboration**: Share tasks and learning goals
- **Advanced Analytics**: More detailed progress insights
- **Reminders**: Email or push notifications
- **Import/Export**: Support for more file formats
- **Offline PWA**: Progressive Web App capabilities

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📞 Support

For support or questions:
1. Check this README for common solutions
2. Review the browser console for error messages
3. Ensure all files are properly uploaded to your hosting

---

**Built with ❤️ for productivity and learning**