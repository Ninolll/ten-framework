"use client"

import { useMultibandTrackVolume } from "@/common"
import { cn } from "@/lib/utils"
import { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import AudioVisualizer from "@/components/Agent/AudioVisualizer"
import { Heart, Sparkles, Stars, Flower2 } from "lucide-react"
import { useState, useEffect } from "react"

export interface AgentViewProps {
  audioTrack?: IMicrophoneAudioTrack
}

// 治愈系音频可视化组件
function HealingAudioVisualizer(props: {
  frequencies: Float32Array[]
  barWidth: number
  minBarHeight: number
  maxBarHeight: number
  borderRadius: number
  gap: number
}) {
  const {
    frequencies,
    gap,
    barWidth,
    minBarHeight,
    maxBarHeight,
    borderRadius,
  } = props

  const summedFrequencies = frequencies.map((bandFrequencies) => {
    const sum = bandFrequencies.reduce((a, b) => a + b, 0)
    if (sum <= 0) return 0
    return Math.sqrt(sum / bandFrequencies.length)
  })

  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: `${gap}px` }}
    >
      {summedFrequencies.map((frequency, index) => {
        const height = minBarHeight + frequency * (maxBarHeight - minBarHeight)
        const style = {
          height: height + "px",
          borderRadius: borderRadius + "px",
          width: barWidth + "px",
          background: "linear-gradient(to top, #90EE90, #98FB98, #AFEEEE)",
          boxShadow: "0 0 8px rgba(144, 238, 144, 0.5)",
          transition: "all 0.3s ease",
          transform: `scaleY(${0.3 + frequency * 0.7})`,
        }

        return <span key={index} className="audio-bar" style={style} />
      })}
    </div>
  )
}

// AI状态指示器
function AIStatusIndicator({ isActive }: { isActive: boolean }) {
  const [breatheScale, setBreatheScale] = useState(1)

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setBreatheScale(scale => scale === 1 ? 1.1 : 1)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isActive])

  return (
    <div className="relative">
      {/* 主头像 */}
      <div 
        className={cn(
          "w-24 h-24 bg-gradient-to-br from-green-300 via-emerald-400 to-teal-400 rounded-full flex items-center justify-center shadow-xl transition-all duration-1000",
          isActive && "shadow-2xl"
        )}
        style={{ transform: `scale(${breatheScale})` }}
      >
        <Heart className="w-12 h-12 text-white healing-pulse" />
      </div>
      
      {/* 外层光环 */}
      <div className="absolute -inset-3 bg-gradient-to-r from-green-300 to-emerald-300 rounded-full opacity-30 blur-lg animate-pulse"></div>
      
      {/* 状态指示点 */}
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
        <div className={cn(
          "w-3 h-3 rounded-full transition-colors",
          isActive ? "bg-green-400 animate-pulse" : "bg-gray-300"
        )}>
        </div>
      </div>
      
      {/* 装饰星星 */}
      {isActive && (
        <>
          <Stars className="absolute -top-2 -left-2 w-4 h-4 text-yellow-300 healing-pulse" style={{animationDelay: '0.5s'}} />
          <Sparkles className="absolute -bottom-1 -left-3 w-3 h-3 text-green-300 healing-pulse" style={{animationDelay: '1s'}} />
        </>
      )}
    </div>
  )
}

export default function AgentView(props: AgentViewProps) {
  const { audioTrack } = props
  const subscribedVolumes = useMultibandTrackVolume(audioTrack, 12)
  const [isActive, setIsActive] = useState(false)

  // 检测是否有音频活动
  useEffect(() => {
    const hasActivity = subscribedVolumes.some(freq => 
      freq.some(val => val > 0.1)
    )
    setIsActive(hasActivity)
  }, [subscribedVolumes])

  return (
    <div className={cn(
      "flex h-auto w-full flex-col items-center justify-center px-6 py-8",
      "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-t-2xl",
      "relative overflow-hidden border-b border-green-100"
    )}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4">
          <Flower2 className="w-8 h-8 text-green-300 healing-float" />
        </div>
        <div className="absolute top-6 right-6">
          <Stars className="w-6 h-6 text-emerald-300 healing-float" style={{animationDelay: '1s'}} />
        </div>
        <div className="absolute bottom-6 left-8">
          <Sparkles className="w-5 h-5 text-green-400 healing-float" style={{animationDelay: '2s'}} />
        </div>
      </div>
      
      {/* AI头像区域 */}
      <div className="relative mb-6 z-10">
        <AIStatusIndicator isActive={isActive} />
      </div>

      {/* 标题和描述 */}
      <div className="mb-4 text-center z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-xl md:text-2xl font-semibold text-green-800">AI 心理伴侣</h2>
          <Sparkles className="w-5 h-5 text-green-500 healing-pulse" />
        </div>
        <p className="text-sm md:text-base text-green-600 opacity-90 font-medium mb-1">
          我在这里倾听你的心声
        </p>
        <p className="text-xs text-green-500 opacity-70">
          {isActive ? "正在聆听..." : "等待你的声音"}
        </p>
      </div>

      {/* 音频可视化 */}
      <div className="mt-6 h-16 w-full flex items-center justify-center z-10">
        <div className="bg-white bg-opacity-50 rounded-2xl p-4 backdrop-blur-sm border border-green-200">
          <HealingAudioVisualizer
            frequencies={subscribedVolumes}
            barWidth={4}
            minBarHeight={4}
            maxBarHeight={48}
            borderRadius={2}
            gap={3}
          />
        </div>
      </div>

      {/* 状态提示 */}
      <div className="mt-4 text-center z-10">
        <div className="inline-flex items-center gap-2 bg-green-100 bg-opacity-80 px-4 py-2 rounded-full backdrop-blur-sm">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )}></div>
          <span className="text-xs text-green-700 font-medium">
            {isActive ? "活跃中" : "待机中"}
          </span>
        </div>
      </div>
    </div>
  )
}