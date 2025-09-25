#!/usr/bin/env python3
# test_vad.py

import sys
import os
import numpy as np

# 添加当前目录到路径，以便导入 config
sys.path.append(os.path.dirname(__file__))

def test_1_import():
    """测试导入"""
    try:
        from ten_vad import TenVad
        print("✅ 1. TenVad 导入成功")
        return True
    except Exception as e:
        print(f"❌ 1. TenVad 导入失败: {e}")
        return False

def test_2_config():
    """测试配置类"""
    try:
        from config import TENVADConfig
        config = TENVADConfig()
        print("✅ 2. 配置类加载成功")
        print(f"   - vad_threshold: {config.vad_threshold}")
        print(f"   - hop_size_ms: {config.hop_size_ms}")
        print(f"   - silence_duration_ms: {config.silence_duration_ms}")
        return True
    except Exception as e:
        print(f"❌ 2. 配置类测试失败: {e}")
        return False

def test_3_vad_creation():
    """测试 VAD 实例创建"""
    try:
        from ten_vad import TenVad
        from config import TENVADConfig
        
        config = TENVADConfig()
        hop_size = config.hop_size_ms * 16000 // 1000  # 转换为 samples
        
        vad = TenVad(hop_size=hop_size, threshold=config.vad_threshold)
        print(f"✅ 3. VAD 实例创建成功 (hop_size={hop_size})")
        return True
    except Exception as e:
        print(f"❌ 3. VAD 实例创建失败: {e}")
        return False

def test_4_vad_processing():
    """测试 VAD 音频处理"""
    try:
        from ten_vad import TenVad
        from config import TENVADConfig
        
        config = TENVADConfig()
        hop_size = config.hop_size_ms * 16000 // 1000
        
        vad = TenVad(hop_size=hop_size, threshold=config.vad_threshold)
        
        # 创建测试音频数据
        audio_data = np.random.randint(-1000, 1000, hop_size, dtype=np.int16)
        
        # 处理音频
        probability, flag = vad.process(audio_data)
        
        print(f"✅ 4. VAD 处理成功")
        print(f"   - 概率: {probability:.3f}")
        print(f"   - 标志: {flag}")
        print(f"   - 音频长度: {len(audio_data)} samples")
        return True
    except Exception as e:
        print(f"❌ 4. VAD 处理失败: {e}")
        return False

def test_5_extension_compatibility():
    """测试与扩展的兼容性"""
    try:
        # 模拟扩展中的使用方式
        from ten_vad import TenVad
        from config import TENVADConfig
        
        config = TENVADConfig()
        hop_size = config.hop_size_ms * 16000 // 1000
        
        # 模拟扩展初始化
        vad = TenVad(hop_size=hop_size, threshold=config.vad_threshold)
        
        # 模拟音频缓冲区处理
        audio_buffer = bytearray()
        test_audio = np.random.randint(-1000, 1000, hop_size * 2, dtype=np.int16)
        audio_bytes = test_audio.tobytes()
        
        audio_buffer.extend(audio_bytes)
        
        if len(audio_buffer) >= hop_size * 2:  # BYTES_PER_SAMPLE = 2
            audio_buf = audio_buffer[:hop_size * 2]
            audio_samples = np.frombuffer(audio_buf, dtype=np.int16)
            probability, flag = vad.process(audio_samples)
            
            print(f"✅ 5. 扩展兼容性测试成功")
            print(f"   - 缓冲区长度: {len(audio_buffer)} bytes")
            print(f"   - 处理样本数: {len(audio_samples)}")
            print(f"   - VAD结果: prob={probability:.3f}, flag={flag}")
        
        return True
    except Exception as e:
        print(f"❌ 5. 扩展兼容性测试失败: {e}")
        return False

if __name__ == "__main__":
    print("🧪 TEN-VAD 集成测试")
    print("=" * 50)
    
    tests = [
        test_1_import,
        test_2_config,
        test_3_vad_creation,
        test_4_vad_processing,
        test_5_extension_compatibility
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"测试结果: {passed}/{len(tests)} 通过")
    
    if passed == len(tests):
        print("🎉 所有测试通过! TEN-VAD 已成功集成")
        print("现在可以在 TEN Framework 中使用 VAD 扩展了")
    else:
        print("⚠️  部分测试失败，请检查错误信息并修复")
        sys.exit(1)