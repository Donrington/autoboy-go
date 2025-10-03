import { motion } from 'framer-motion';

const ThemeToggle = ({ darkMode, toggleTheme }) => {
  return (
    <motion.div 
      className="theme-toggle" 
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ rotate: darkMode ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.i 
        className={darkMode ? "fas fa-moon" : "fas fa-sun"}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatType: "reverse" 
        }}
      />
    </motion.div>
  );
};

export default ThemeToggle;