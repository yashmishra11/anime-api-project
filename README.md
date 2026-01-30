# 🎌 Anime API Project

A modern, responsive anime discovery platform built with React and the Jikan API (MyAnimeList). Browse popular, airing, and upcoming anime with a beautiful glassmorphism UI design.

![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react)
![Styled Components](https://img.shields.io/badge/Styled_Components-6.x-db7093?logo=styled-components)
![Jikan API](https://img.shields.io/badge/API-Jikan-blue)

## ✨ Features

- 🔥 **Browse Anime Categories**: Popular, Currently Airing, and Upcoming anime
- 🔍 **Search Functionality**: Find your favorite anime quickly
- 📊 **Detailed Anime Information**: View ratings, scores, synopsis, and more
- 🎭 **Character Gallery**: Explore characters from each anime
- 🖼️ **Image Gallery**: View anime screenshots and artwork
- 🎨 **Modern Glassmorphism UI**: Beautiful gradient backgrounds with glass effects
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- ⚡ **Smooth Animations**: Cubic-bezier transitions for natural interactions

## 🚀 Demo

[Live Demo](#) <!-- Add your deployment link here -->

## 📸 Screenshots

<!-- Add screenshots of your application here -->

## 🛠️ Built With

- **React** - JavaScript library for building user interfaces
- **React Router** - Declarative routing for React applications
- **Styled Components** - CSS-in-JS styling solution
- **Jikan API v4** - Unofficial MyAnimeList API
- **Context API** - State management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yashmishra11/anime-api-project.git
   cd anime-api-project
```

2. **Install dependencies**
```bash
   npm install
```

3. **Start the development server**
```bash
   npm start
```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure
```
anime-api-project/
├── public/
│   ├── naruto.ttf          # Custom font
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Homepage.js     # Main landing page
│   │   ├── Popular.js      # Popular anime grid
│   │   ├── Airing.js       # Currently airing anime
│   │   ├── Upcoming.js     # Upcoming anime
│   │   ├── Sidebar.js      # Top 5 sidebar
│   │   ├── AnimeItem.js    # Detailed anime view
│   │   └── Gallery.js      # Image gallery
│   ├── context/
│   │   └── global.js       # Global state management
│   ├── GlobalStyle.js      # Global CSS styles
│   └── App.js
├── package.json
└── README.md
```

## 🎯 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder with optimized performance

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App for full configuration control

## 🌐 API Reference

This project uses the [Jikan API v4](https://docs.api.jikan.moe/) - an unofficial MyAnimeList API.

**Endpoints used:**
- `/anime` - Get anime listings
- `/anime/{id}` - Get anime details
- `/anime/{id}/characters` - Get anime characters
- `/anime/{id}/pictures` - Get anime images

## 🎨 Design Features

- **Gradient Background**: Purple gradient theme (#667eea to #764ba2)
- **Glassmorphism**: Semi-transparent containers with backdrop blur
- **Smooth Animations**: Cubic-bezier transitions for natural motion
- **Hover Effects**: Interactive cards with lift and scale animations
- **Custom Scrollbar**: Modern glass-effect scrollbar
- **Responsive Grid**: Auto-fill grid system for all screen sizes

## 📱 Responsive Breakpoints

- Mobile: < 480px
- Tablet: 481px - 1024px
- Desktop: > 1024px

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Yash Mishra**
- GitHub: [@yashmishra11](https://github.com/yashmishra11)

## 🙏 Acknowledgments

- [Jikan API](https://jikan.moe/) for providing the MyAnimeList data
- [MyAnimeList](https://myanimelist.net/) for anime information
- Create React App for the initial setup
- Styled Components community for styling solutions

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

⭐ If you find this project useful, please consider giving it a star!
