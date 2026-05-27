import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white/80 hover:bg-white/10 hover:text-white"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
    >
      <Sun className="sun-spin h-[1.2rem] w-[1.2rem] scale-100 transition-all dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 opacity-0 transition-all dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
