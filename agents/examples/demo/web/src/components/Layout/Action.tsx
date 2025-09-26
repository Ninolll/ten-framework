"use client"

import * as React from "react"

import {
  setAgentConnected,
  setMobileActiveTab,
  setGlobalSettingsDialog,
} from "@/store/reducers/global"
import {
  useAppDispatch,
  useAppSelector,
  apiPing,
  apiStartService,
  apiStopService,
  MOBILE_ACTIVE_TAB_MAP,
  EMobileActiveTab,
  type StartRequestConfig,
} from "@/common"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import SettingsDialog, {
  isCozeGraph,
  cozeSettingsFormSchema,
  isDifyGraph,
  difySettingsFormSchema,
  oceanbaseSettingsFormSchema,
} from "@/components/Dialog/Settings"
import { IOceanBaseSettings } from "@/types"
import { Heart, Sparkles, Flower2 } from "lucide-react"

let intervalId: NodeJS.Timeout | null = null

// 治愈系连接按钮组件
function HealingConnectButton({ 
  loading, 
  agentConnected, 
  onClick 
}: {
  loading: boolean
  agentConnected: boolean  
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "healing-button min-w-32 font-medium transition-all duration-300 relative overflow-hidden",
        loading && "opacity-70 cursor-not-allowed",
        agentConnected && "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600"
      )}
    >
      {/* 按钮光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      
      <div className="flex items-center gap-2 relative z-10">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>连接中...</span>
          </>
        ) : agentConnected ? (
          <>
            <Heart className="w-4 h-4" />
            <span>结束对话</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 healing-pulse" />
            <span>开始治愈</span>
          </>
        )}
      </div>
    </button>
  )
}

export default function Action(props: { className?: string }) {
  const { className } = props
  const dispatch = useAppDispatch()
  const agentConnected = useAppSelector((state) => state.global.agentConnected)
  const channel = useAppSelector((state) => state.global.options.channel)
  const userId = useAppSelector((state) => state.global.options.userId)
  const language = useAppSelector((state) => state.global.language)
  const voiceType = useAppSelector((state) => state.global.voiceType)
  const graphName = useAppSelector((state) => state.global.graphName)
  const agentSettings = useAppSelector((state) => state.global.agentSettings)
  const cozeSettings = useAppSelector((state) => state.global.cozeSettings)
  const difySettings = useAppSelector((state) => state.global.difySettings)
  const oceanbaseSettings = useAppSelector((state) => state.global.oceanbaseSettings)
  const mobileActiveTab = useAppSelector(
    (state) => state.global.mobileActiveTab,
  )

  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (channel) {
      checkAgentConnected()
    }
  }, [channel])

  const checkAgentConnected = async () => {
    const res: any = await apiPing(channel)
    if (res?.code == 0) {
      dispatch(setAgentConnected(true))
    }
  }

  const onClickConnect = async () => {
    if (loading) {
      return
    }
    setLoading(true)
    try {
      if (agentConnected) {
        // handle disconnect
        await apiStopService(channel)
        dispatch(setAgentConnected(false))
        toast.success("已结束对话，期待下次与你相遇 💚", {
          description: "记得多关爱自己哦",
        })
        stopPing()
      } else {
        // handle connect
        // prepare start service payload
        const startServicePayload: StartRequestConfig = {
          channel,
          userId,
          graphName,
          language,
          voiceType,
          greeting: agentSettings.greeting,
          prompt: agentSettings.prompt,
        }
        // check graph ---
        if (isCozeGraph(graphName)) {
          // check coze settings
          const cozeSettingsResult =
            cozeSettingsFormSchema.safeParse(cozeSettings)
          if (!cozeSettingsResult.success) {
            dispatch(
              setGlobalSettingsDialog({
                open: true,
                tab: "coze",
              }),
            )
            throw new Error(
              "Invalid Coze settings. Please check your settings.",
            )
          }
          startServicePayload.coze_token = cozeSettingsResult.data.token
          startServicePayload.coze_bot_id = cozeSettingsResult.data.bot_id
          startServicePayload.coze_base_url = cozeSettingsResult.data.base_url
        } else if (isDifyGraph(graphName)) {
          const difySettingsResult = difySettingsFormSchema.safeParse(difySettings)
          if (!difySettingsResult.success) {
            dispatch(
              setGlobalSettingsDialog({
                open: true,
                tab: "dify",
              }),
            )
            throw new Error(
              "Invalid Dify settings. Please check your settings.",
            )
          }
          startServicePayload.dify_api_key = difySettingsResult.data.api_key
          startServicePayload.dify_base_url = difySettingsResult.data.base_url
        } else if (graphName.includes("oceanbase")) {
          const oceanBaseSettingsResult = oceanbaseSettingsFormSchema.safeParse(oceanbaseSettings)
          if (!oceanBaseSettingsResult.success) {
            dispatch(
              setGlobalSettingsDialog({
                open: true,
                tab: "oceanbase",
              }),
            )
            throw new Error(
              "Invalid OceanBase settings. Please check your settings.",
            )
          }
          const settings: IOceanBaseSettings = {
            api_key: oceanBaseSettingsResult.data.api_key,
            base_url: oceanBaseSettingsResult.data.base_url,
            db_name: oceanBaseSettingsResult.data.db_name,
            collection_id: oceanBaseSettingsResult.data.collection_id,
          }
          startServicePayload.oceanbase_settings = settings
        }
        // common -- start service
        const res = await apiStartService(startServicePayload)
        const { code, msg } = res || {}
        if (code != 0) {
          if (code == "10001") {
            toast.error(
              "当前体验人数较多，请稍后再试 🌸",
              {
                description: "我们正在为你准备最好的治愈体验"
              }
            )
          } else {
            toast.error(`连接失败: ${msg}`, {
              description: "请检查网络或稍后重试"
            })
          }
          throw new Error(msg)
        }
        dispatch(setAgentConnected(true))
        toast.success("🌟 治愈之旅开始了!", {
          description: "我在这里倾听你的心声，陪伴你的每一刻"
        })
        startPing()
      }
    } catch (error) {
      console.error(error)
      const errorMessage = (error as Error)?.message || "未知错误"
      toast.error("连接遇到问题", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const startPing = () => {
    if (intervalId) {
      stopPing()
    }
    intervalId = setInterval(() => {
      apiPing(channel)
    }, 3000)
  }

  const stopPing = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  const onChangeMobileActiveTab = (tab: string) => {
    dispatch(setMobileActiveTab(tab as EMobileActiveTab))
  }

  return (
    <>
      {/* Action Bar */}
      <div
        className={cn(
          "mx-2 mt-2 flex items-center justify-between rounded-t-lg p-3 md:m-2 md:rounded-lg",
          "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100",
          "backdrop-blur-sm",
          className,
        )}
      >
        {/* -- Description Part */}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-green-500 healing-pulse" />
            <span className="text-sm font-bold text-green-800">治愈描述</span>
          </div>
          <span className="ml-7 text-xs text-green-600 opacity-80">
            与AI心理伴侣开启一场温暖的对话，在这里找到内心的平静与力量
          </span>
        </div>

        <Tabs
          defaultValue={mobileActiveTab}
          className="w-[400px] md:hidden"
          onValueChange={onChangeMobileActiveTab}
        >
          <TabsList className="bg-green-100 border border-green-200">
            {Object.values(EMobileActiveTab).map((tab) => (
              <TabsTrigger 
                key={tab} 
                value={tab} 
                className="w-24 text-sm data-[state=active]:bg-white data-[state=active]:text-green-700"
              >
                {MOBILE_ACTIVE_TAB_MAP[tab]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* -- Action Button */}
        <div className="ml-auto flex items-center gap-3">
          <SettingsDialog />
          <HealingConnectButton
            loading={loading}
            agentConnected={agentConnected}
            onClick={onClickConnect}
          />
        </div>
      </div>
    </>
  )
}