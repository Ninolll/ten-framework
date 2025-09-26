"use client"

import { useAppSelector, EMobileActiveTab } from "@/common"
import dynamic from "next/dynamic"

import Header from "@/components/Layout/Header"
import Action from "@/components/Layout/Action"
import AuthInitializer from "@/components/authInitializer"
import { cn } from "@/lib/utils"
import { Heart, Sparkles, Leaf, Stars, Flower } from "lucide-react"

const DynamicRTCCard = dynamic(() => import("@/components/Dynamic/RTCCard"), {
  ssr: false,
})

const DynamicChatCard = dynamic(() => import("@/components/Chat/ChatCard"), {
  ssr: false,
})

export default function Home() {
  const mobileActiveTab = useAppSelector(
    (state) => state.global.mobileActiveTab,
  )

  return (
    <AuthInitializer>
      {/* 治愈系背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* 浮动装饰元素 */}
        <div className="absolute top-10 left-10 opacity-20">
          <Leaf className="w-16 h-16 text-green-300 healing-float" />
        </div>
        <div className="absolute top-20 right-20 opacity-15">
          <Sparkles className="w-12 h-12 text-green-200 healing-float" style={{animationDelay: '1s'}} />
        </div>
        <div className="absolute bottom-32 left-16 opacity-10">
          <Heart className="w-20 h-20 text-green-100 healing-float" style={{animationDelay: '2s'}} />
        </div>
        <div className="absolute top-1/3 right-10 opacity-15">
          <Stars className="w-10 h-10 text-emerald-200 healing-float" style={{animationDelay: '0.5s'}} />
        </div>
        <div className="absolute bottom-20 right-20 opacity-20">
          <Flower className="w-14 h-14 text-green-300 healing-float" style={{animationDelay: '1.5s'}} />
        </div>

        {/* 渐变光晕 */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-200 to-transparent opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-200 to-transparent opacity-20 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex h-full min-h-screen flex-col md:h-screen z-10">
        <Header className="h-[60px] healing-header" />
        <Action className="h-[48px]" />
        
        <div className="mx-2 mb-2 flex h-full max-h-[calc(100vh-108px-24px)] flex-col md:flex-row md:gap-4">
          <DynamicRTCCard
            className={cn(
              "m-0 w-full healing-card md:w-[480px]",
              {
                ["hidden md:block"]: mobileActiveTab === EMobileActiveTab.CHAT,
              },
            )}
          />
          <DynamicChatCard
            className={cn(
              "m-0 w-full healing-card",
              {
                ["hidden md:block"]: mobileActiveTab === EMobileActiveTab.AGENT,
              },
            )}
          />
        </div>

        {/* 移动端治愈提示 */}
        <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 bg-green-50 border border-green-200 rounded-full px-4 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <Heart className="w-4 h-4 healing-pulse" />
            <span>在这里找到内心的平静</span>
          </div>
        </div>
      </div>
    </AuthInitializer>
  )
}