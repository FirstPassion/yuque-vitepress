```python
import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import psutil

class ProcessMonitor:
    def __init__(self, root):
        self.root = root
        self.root.title("Windows 进程监控")
        
        # 创建样式
        self.style = ttk.Style()

        # 创建主框架
        self.main_frame = tk.Frame(root)  # 主框架
        self.main_frame.pack(pady=10)

        # 默认主题
        self.current_theme = "dark"

        # 创建按钮框架
        self.button_frame = tk.Frame(root)  # 按钮框架
        self.button_frame.pack(pady=10)

        # 设置主题
        self.set_theme(self.current_theme)

        # 创建菜单
        self.menu = tk.Menu(root)
        self.root.config(menu=self.menu)
        self.theme_menu = tk.Menu(self.menu, tearoff=0)
        self.menu.add_cascade(label="主题", menu=self.theme_menu)
        self.theme_menu.add_command(label="深色主题", command=lambda: self.change_theme("dark"))
        self.theme_menu.add_command(label="浅色主题", command=lambda: self.change_theme("light"))

        # 创建进程表格
        self.process_tree = ttk.Treeview(self.main_frame, columns=("图标", "PID", "名称", "CPU (%)", "内存 (MB)"), show='headings', height=20)
        self.process_tree.heading("图标", text="图标")
        self.process_tree.heading("PID", text="PID")
        self.process_tree.heading("名称", text="名称")
        self.process_tree.heading("CPU (%)", text="CPU (%)")
        self.process_tree.heading("内存 (MB)", text="内存 (MB)")
        self.process_tree.pack()

        # 创建按钮样式
        self.create_button_style()

        # 创建排序按钮
        self.sort_by_cpu_button = ttk.Button(self.button_frame, text="按 CPU 排序", command=self.sort_by_cpu)
        self.sort_by_cpu_button.grid(row=0, column=0, padx=5)

        self.sort_by_memory_button = ttk.Button(self.button_frame, text="按内存排序", command=self.sort_by_memory)
        self.sort_by_memory_button.grid(row=0, column=1, padx=5)

        # 创建手动刷新和杀死进程按钮
        self.refresh_button = ttk.Button(self.button_frame, text="刷新", command=self.refresh_processes)
        self.refresh_button.grid(row=0, column=2, padx=5)

        self.kill_button = ttk.Button(self.button_frame, text="杀死进程", command=self.kill_process)
        self.kill_button.grid(row=0, column=3, padx=5)

        self.processes = []
        self.refresh_processes()  # 初始加载进程信息

    def set_theme(self, theme):
        """设置主题"""
        if theme == "dark":
            self.bg_color = "#3C3F41"
            self.fg_color = "white"
            self.header_color = "#5A5E62"
            self.button_color = "#4B4E52"
        else:  # light theme
            self.bg_color = "#FFFFFF"
            self.fg_color = "black"
            self.header_color = "#D3D3D3"
            self.button_color = "#C0C0C0"

        self.main_frame.configure(bg=self.bg_color)
        self.button_frame.configure(bg=self.bg_color)
        self.create_treeview_style()
        self.create_button_style()

    def create_treeview_style(self):
        """创建Treeview样式"""
        self.style.configure("Treeview", background=self.bg_color, foreground=self.fg_color, fieldbackground=self.bg_color)
        self.style.configure("Treeview.Heading", background=self.header_color, foreground=self.fg_color, font=('Arial', 10, 'bold'))  # 表头样式
        self.style.map("Treeview", background=[("selected", self.button_color)])  # 选中行的背景色

    def create_button_style(self):
        """创建按钮样式"""
        self.style.configure("TButton", background=self.button_color, foreground=self.fg_color, font=('Arial', 10, 'bold'))  # 按钮样式
        self.style.map("TButton", background=[("active", "#5A5E62")])  # 鼠标悬停时的背景色

    def change_theme(self, theme):
        """切换主题"""
        self.current_theme = theme
        self.set_theme(theme)

    def refresh_processes(self):
        self.process_tree.bind("<Button-1>", lambda e: "break")  # 禁用点击事件
        self.processes.clear()
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
            try:
                memory_usage = proc.info['memory_info'].rss / (1024 * 1024)  # 转换为MB
                cpu_usage = proc.info['cpu_percent'] if proc.info['cpu_percent'] is not None else 0
                icon = self.get_process_icon(proc.info['pid'])
                self.processes.append((icon, proc.info['pid'], proc.info['name'], cpu_usage, memory_usage))
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        self.display_processes()
        self.process_tree.bind("<Button-1>", lambda e: None)  # 恢复点击事件

    def display_processes(self):
        # 清空表格
        self.process_tree.delete(*self.process_tree.get_children())
        # 插入新数据
        for index, (icon, pid, name, cpu, memory) in enumerate(self.processes):
            if index % 2 == 0:
                self.process_tree.insert("", tk.END, values=(icon, pid, name, cpu, f"{memory:.2f}"), tags=('evenrow',))
            else:
                self.process_tree.insert("", tk.END, values=(icon, pid, name, cpu, f"{memory:.2f}"), tags=('oddrow',))

    def get_process_icon(self, pid):
        # 这里可以添加获取进程图标的逻辑
        return "🖥️"  # 示例图标，实际应用中可以使用图标库

    def sort_by_cpu(self):
        self.processes.sort(key=lambda x: x[3], reverse=True)  # 根据CPU占用排序
        self.display_processes()

    def sort_by_memory(self):
        self.processes.sort(key=lambda x: x[4], reverse=True)  # 根据内存占用排序
        self.display_processes()

    def kill_process(self):
        try:
            selected_item = self.process_tree.selection()[0]
            selected_process = self.process_tree.item(selected_item, 'values')
            pid = int(selected_process[1])
            psutil.Process(pid).terminate()
            messagebox.showinfo("成功", f"进程 {pid} 已成功杀死。")
            self.refresh_processes()
        except Exception as e:
            messagebox.showerror("错误", str(e))

if __name__ == "__main__":
    root = tk.Tk()
    app = ProcessMonitor(root)
    root.mainloop()

```

