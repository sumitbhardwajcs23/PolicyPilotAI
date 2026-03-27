import os

kimi_css_path = r"c:\Users\Asus\Desktop\SD\projects\Guid wire\Kimi_Agent_Full Webapp & User Guide\app\src\index.css"
target_css_path = r"c:\Users\Asus\Desktop\SD\projects\Guid wire\gigshield-platform\gigshield-platform\frontend\src\index.css"

with open(kimi_css_path, "r", encoding="utf-8") as f:
    kimi_css = f.read()

# Filter out the repeating @tailwind directives from the Kimi CSS to avoid duplication
lines = kimi_css.split("\n")
clean_lines = [line for line in lines if not line.startswith("@tailwind")]
clean_kimi_css = "\n".join(clean_lines)

with open(target_css_path, "a", encoding="utf-8") as f:
    f.write("\n\n/* --- KIMI LANDING CSS --- */\n\n")
    f.write(clean_kimi_css)

print("CSS merged successfully.")
