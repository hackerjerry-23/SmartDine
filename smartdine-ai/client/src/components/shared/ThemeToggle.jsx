import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      className="rounded-md border border-stone-700 px-3 py-1.5 text-sm text-stone-300 hover:text-stone-100 hover:border-stone-500 transition-colors"
    >
      {theme === 'dark' ? '☀ Light' : '● Dark'}
    </button>
  );
}
