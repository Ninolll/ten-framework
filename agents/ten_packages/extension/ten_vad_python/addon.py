# TEN VAD 扩展注册入口
from ten_runtime import (
    Addon,
    register_addon_as_extension,
    TenEnv,
)

from .extension import TenVadExtension

@register_addon_as_extension("ten_vad_python")
class TenVadAddon(Addon):
    def on_create_instance(self, ten_env: TenEnv, name: str, context) -> None:
        ten_env.log_info("[ten_vad] on_create_instance")
        ten_env.on_create_instance_done(TenVadExtension(name), context)
