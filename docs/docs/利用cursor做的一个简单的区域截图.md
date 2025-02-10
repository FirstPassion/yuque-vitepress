```python
import pyautogui
import tkinter as tk
from tkinter import messagebox
import keyboard
import pystray
from PIL import Image
import threading
import os


class ScreenshotOCR:
    def __init__(self):
        self.start_x = None
        self.start_y = None
        self.end_x = None
        self.end_y = None
        self.is_selecting = False
        self.selection_rect = None
        self.running = True
        
        # 创建主窗口但不显示
        self.root = tk.Tk()
        self.root.withdraw()
        
        # 注册截图热键
        keyboard.add_hotkey('ctrl+alt+s', self.start_screenshot)
        
        # 创建系统托盘图标
        self.create_tray_icon()

    def create_tray_icon(self):
        try:
            # 创建一个16x16的黑色图标
            image = Image.new('RGBA', (16, 16), color=(0, 0, 0, 255))
            
            # 创建托盘图标
            menu = (pystray.MenuItem('退出', self.safe_quit),)
            self.icon = pystray.Icon(
                "screenshot",
                image,
                "截图工具",
                menu
            )
            
            # 在新线程中运行托盘图标
            self.tray_thread = threading.Thread(target=self.run_tray, daemon=True)
            self.tray_thread.start()
        except Exception as e:
            print(f"创建托盘图标失败: {e}")
            # 如果创建托盘图标失败，仍然可以继续运行程序
            pass

    def run_tray(self):
        try:
            self.icon.run()
        except Exception as e:
            print(f"托盘图标运行错误: {e}")
            pass

    def safe_quit(self, icon=None, item=None):
        """安全退出程序"""
        print("\n程序正在退出...")
        self.running = False
        try:
            # 先停止托盘图标
            if hasattr(self, 'icon') and self.icon is not None:
                self.icon.stop()
            
            # 取消所有键盘钩子
            keyboard.unhook_all()
            
            # 销毁所有窗口
            if hasattr(self, 'screenshot_window'):
                self.screenshot_window.destroy()
            
            # 使用 after 方法来延迟退出
            self.root.after(100, lambda: self.final_quit())
            
        except Exception as e:
            print(f"退出时发生错误: {e}")
            self.final_quit()

    def final_quit(self):
        """最终的退出操作"""
        try:
            self.root.destroy()
        except Exception:
            pass
        finally:
            os._exit(0)  # 使用 os._exit() 替代 sys.exit()

    def start_screenshot(self):
        # 防止重复触发
        if hasattr(self, 'screenshot_window') and self.screenshot_window.winfo_exists():
            return
            
        # 创建全屏透明窗口
        self.screenshot_window = tk.Toplevel(self.root)
        self.screenshot_window.attributes('-fullscreen', True, '-alpha', 0.1)  # 降低透明度
        self.screenshot_window.configure(background='black')  # 改为黑色背景
        
        # 创建画布
        self.canvas = tk.Canvas(self.screenshot_window, highlightthickness=0)
        self.canvas.pack(fill='both', expand=True)
        
        # 显示提示文本
        self.canvas.create_text(
            self.root.winfo_screenwidth() // 2,
            50,
            text="按住鼠标左键拖动选择区域，按ESC取消",
            fill="white",
            font=("Arial", 16)
        )
        
        # 绑定鼠标事件
        self.canvas.bind('<Button-1>', self.on_mouse_down)
        self.canvas.bind('<B1-Motion>', self.on_mouse_move)
        self.canvas.bind('<ButtonRelease-1>', self.on_mouse_up)
        self.screenshot_window.bind('<Escape>', lambda e: self.screenshot_window.destroy())
        
    def on_mouse_down(self, event):
        self.start_x = event.x
        self.start_y = event.y
        self.is_selecting = True
        
        # 清除之前的选择框
        self.canvas.delete('all')
        
        # 创建选择框
        self.selection_rect = self.canvas.create_rectangle(
            self.start_x, self.start_y, self.start_x, self.start_y,
            outline='#00ff00', width=2  # 使用亮绿色
        )
        
    def on_mouse_move(self, event):
        if self.is_selecting:
            self.end_x = event.x
            self.end_y = event.y
            
            # 更新选择框
            self.canvas.delete('all')
            
            # 绘制遮罩
            screen_width = self.root.winfo_screenwidth()
            screen_height = self.root.winfo_screenheight()
            
            # 创建四个遮罩区域
            x1, y1 = min(self.start_x, self.end_x), min(self.start_y, self.end_y)
            x2, y2 = max(self.start_x, self.end_x), max(self.start_y, self.end_y)
            
            # 上方遮罩
            self.canvas.create_rectangle(0, 0, screen_width, y1, 
                                       fill='black', stipple='gray50')
            # 下方遮罩
            self.canvas.create_rectangle(0, y2, screen_width, screen_height, 
                                       fill='black', stipple='gray50')
            # 左侧遮罩
            self.canvas.create_rectangle(0, y1, x1, y2, 
                                       fill='black', stipple='gray50')
            # 右侧遮罩
            self.canvas.create_rectangle(x2, y1, screen_width, y2, 
                                       fill='black', stipple='gray50')
            
            # 绘制选择框
            self.canvas.create_rectangle(
                self.start_x, self.start_y,
                self.end_x, self.end_y,
                outline='#00ff00', width=2
            )
            
            # 绘制四角
            corner_size = 10
            corners = [
                (x1, y1),  # 左上
                (x2, y1),  # 右上
                (x1, y2),  # 左下
                (x2, y2)   # 右下
            ]
            
            for x, y in corners:
                self.canvas.create_line(x-corner_size, y, x+corner_size, y, 
                                      fill='#00ff00', width=2)
                self.canvas.create_line(x, y-corner_size, x, y+corner_size, 
                                      fill='#00ff00', width=2)
            
            # 显示尺寸信息
            width = abs(self.end_x - self.start_x)
            height = abs(self.end_y - self.start_y)
            info_text = f'{width} × {height}'
            
            text_y = y1 - 25 if y1 > 25 else y2 + 25
            self.canvas.create_text(
                (x1 + x2) // 2,
                text_y,
                text=info_text,
                fill='white',
                font=('Arial', 12)
            )
        
    def on_mouse_up(self, event):
        if self.is_selecting:
            self.is_selecting = False
            self.end_x = event.x
            self.end_y = event.y
            self.screenshot_window.destroy()
            self.capture_and_process()
        
    def capture_and_process(self):
        # 确保坐标正确（处理从右下角到左上角的选择）
        left = min(self.start_x, self.end_x)
        top = min(self.start_y, self.end_y)
        right = max(self.start_x, self.end_x)
        bottom = max(self.start_y, self.end_y)
        
        # 截图
        screenshot = pyautogui.screenshot(region=(left, top, right-left, bottom-top))
        screenshot.save('screenshot.png')
        # OCR识别
        try:
            text = 'hello'
            if text.strip():
                # 显示结果
                result_window = tk.Toplevel(self.root)
                result_window.title("识别结果")
                result_window.geometry("400x300")
                
                # 创建文本框
                text_widget = tk.Text(result_window, wrap=tk.WORD)
                text_widget.pack(fill=tk.BOTH, expand=True)
                
                # 显示原文和翻译
                text_widget.insert(tk.END, "原文:\n")
                text_widget.insert(tk.END, text + "\n\n")
                text_widget.insert(tk.END, "翻译:\n")
                text_widget.insert(tk.END, '这里是识别内容')
                
            else:
                messagebox.showinfo("提示", "未能识别到文字")
        except Exception as e:
            messagebox.showerror("错误", f"处理过程中出现错误：{str(e)}")
            
    def run(self):
        print("程序已启动，按Ctrl+Alt+S开始截图...")
        print("右键点击系统托盘图标可退出程序")
        try:
            self.root.mainloop()
        except Exception as e:
            print(f"发生错误: {e}")
            self.safe_quit()

if __name__ == "__main__":
    app = ScreenshotOCR()
    app.run()
```

