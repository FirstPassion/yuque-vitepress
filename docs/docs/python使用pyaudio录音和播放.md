## 安装`pyaudio`
```shell
pip install pyaudio
```

## 录音
```python
import pyaudio
import wave

def record_audio(output_file: str, record_seconds: int) -> None:
    """
    保存录音到指定文件
    output_file: 输出文件名
    record_seconds: 录音时长
    """
    CHUNK = 1024
    FORMAT = pyaudio.paInt16
    CHANNELS = 1
    RATE = 44100

    audio = pyaudio.PyAudio()

    stream = audio.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)
    wf = wave.open(output_file, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    for _ in range(0, int(RATE / CHUNK * record_seconds)):
        data = stream.read(CHUNK)
        wf.writeframes(data)
    wf.close()
    stream.stop_stream()
    stream.close()
    audio.terminate()
```

## 播放
同步播放

```python
def play_audio(input_file: str) -> None:
    """
    播放音频文件
    input_file: 输入文件名
    """
    CHUNK = 1024
    wf = wave.open(input_file, 'rb')
    audio = pyaudio.PyAudio()
    stream = audio.open(format=audio.get_format_from_width(wf.getsampwidth()),
               channels=wf.getnchannels(),
               rate=wf.getframerate(),
               output=True)
    data = wf.readframes(CHUNK)
    datas = []
    while data != b'':
        datas.append(data)
        data = wf.readframes(CHUNK)
    for data in datas:
        stream.write(data)
    stream.stop_stream()
    stream.close()
    audio.terminate()
```

<font style="color:rgb(25, 27, 31);">以回调方式播放音频</font>

<font style="color:rgb(25, 27, 31);">当需要在执行其他程序时同时播放音频，可以使用回调的方式播放</font>

```python
def play_audio_callback(input_file: str) -> None:
    """
    播放音频文件，使用callback方式
    input_file: 输入文件名
    """
    CHUNK = 1024
    wf = wave.open(input_file, 'rb')

    def callback(in_data, frame_count, time_info, status):
        data = wf.readframes(frame_count)
        return (data, pyaudio.paContinue)

    audio = pyaudio.PyAudio()
    stream = audio.open(format=audio.get_format_from_width(wf.getsampwidth()),
               channels=wf.getnchannels(), 
               rate=wf.getframerate(),
               output=True,
               stream_callback=callback)
    stream.start_stream()
    while stream.is_active():
        continue
    stream.stop_stream()
    stream.close()
    audio.terminate()
```

## 自制简单录音机
```python
import argparse
import wave
import pyaudio


def record_audio(output_file: str, record_seconds: int) -> None:
    """
    保存录音到指定文件
    output_file: 输出文件名
    record_seconds: 录音时长
    """
    CHUNK = 2048
    FORMAT = pyaudio.paInt32
    CHANNELS = 1
    RATE = 48000

    audio = pyaudio.PyAudio()
    print(f"正在录音，请保持说话...")
    stream = audio.open(format=FORMAT,
                        channels=CHANNELS,
                        rate=RATE,
                        input=True,
                        frames_per_buffer=CHUNK)
    wf = wave.open(output_file, 'wb')
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(audio.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    for _ in range(0, int(RATE / CHUNK * record_seconds)):
        data = stream.read(CHUNK)
        wf.writeframes(data)
    stream.stop_stream()
    stream.close()
    audio.terminate()
    wf.close()
    print(f"录音完成，保存至 {output_file}")


parser = argparse.ArgumentParser(description='命令行参数',
                                 epilog='欢迎使用命令行参数解析器',
                                 formatter_class=argparse.RawTextHelpFormatter)
# 添加参数 required=True 表示必须传入
parser.add_argument('-o', '--output', type=str, help='输出文件路径', required=True)
parser.add_argument('-s', '--second', type=int, help='录音时长', required=True)
if __name__ == '__main__':
    # 获取命令行参数
    args = parser.parse_args()
    try:
        output_file = args.output
        record_seconds = args.second + 1

        if not output_file.endswith('.wav'):
            output_file = output_file + '.wav'

        record_audio(output_file, record_seconds)
    except Exception as e:
        raise e
```

