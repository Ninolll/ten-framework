import { TenLogo } from "@/components/Icon"
import { HeaderActions } from "./HeaderComponents"
import { cn } from "@/lib/utils"
import { Heart, Sparkles } from "lucide-react"

export default function Header(props: { className?: string }) {
  const { className } = props
  return (
    <>
      {/* Header */}
      <header
        className={cn(
          "flex items-center justify-between p-4 font-roboto backdrop-blur-lg border-b border-green-100",
          className,
        )}
      >
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <TenLogo className="h-6 md:h-8 text-green-600 transition-transform group-hover:scale-105" />
            <div className="absolute -inset-2 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-20 blur group-hover:opacity-30 transition-opacity"></div>
            <Heart className="absolute -top-1 -right-1 w-4 h-4 text-green-400 healing-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                心灵花园 AI
              </h1>
              <Sparkles className="w-5 h-5 text-green-400 healing-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            <p className="text-xs md:text-sm text-green-600 opacity-80 font-medium">
              治愈你的每一刻 · 陪伴你的每一天
            </p>
          </div>
        </div>
        <HeaderActions />
      </header>
    </>
  )
}