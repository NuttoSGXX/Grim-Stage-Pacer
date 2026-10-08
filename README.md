# Stage Pacer

โมดูล Foundry VTT (V13 / V14) สำหรับคุมจังหวะโต๊ะ: ปุ่มสัญญาณของ DM และผู้เล่นแยกกัน
กดแล้วมีแถบข้อความวิ่งบาง ๆ ที่ขอบบนของจอทุกคน ธีมดำ–แดงชุดเดียวกับ Grim Almanac / Grim Pulse

## ปุ่ม

| ฝั่ง | ปุ่ม | แถบ | ข้อความที่วิ่ง |
|---|---|---|---|
| DM | ดาว | แดง | DM · STAR OF STAGE — Hold your lines — please don't interrupt |
| DM | ไปข้างหน้า | เหลือง | NEXT SCENE — Wrap it up — the story moves on |
| DM | ไมค์ | ฟ้า | YOUR CUE — The stage is yours — speak up or answer |
| DM | สี่เหลี่ยม | – | เปิดเมนู Intermission / Session End |
| Player | ดาว | แดง | {ชื่อ} IS STAR OF STAGE — Spotlight, please — let them finish |
| Player | ไมค์ | ฟ้า | {ชื่อ} WANTS THE MIC — More to say — may I continue? |
| Player | หลอดไฟ | เหลือง | {ชื่อ} IS THINKING — Give them a moment |
| Player | ประตู | – | ดับ/เปิดไฟหน้าชื่อตัวเองในรายชื่อ (BRB) ไม่มีแถบแจ้งเตือน |

- ปุ่มสัญญาณเป็นแบบกดเปิด / กดซ้ำเพื่อปิด แต่ละคนเปิดได้ทีละหนึ่งสัญญาณ
- หลายคนกดพร้อมกันได้ แถบจะซ้อนกันลงมา (ของ DM อยู่บนสุด)
- DM กดไอคอนสัญญาณท้ายชื่อผู้เล่นเพื่อเคลียร์ให้ หรือกด ✕ เพื่อเคลียร์ทั้งหมด และกดดวงไฟหน้าชื่อเพื่อเปิด/ดับแทนผู้เล่นได้

## ปิดม่าน (ปุ่มสี่เหลี่ยมของ DM)

เลือก **Intermission** (พักเบรก) หรือ **Session End** จอทุกคนค่อย ๆ เฟดดำ ตัวอักษรขึ้นทีละตัว
เส้นใต้ลากออกจากกลาง แล้วตามด้วยประโยคสุ่ม 1 ใน 6 จากนั้นย้ายทุกคนไปซีนที่เลือกไว้ใน **Return to**
(จำค่าไว้ให้ เลือก "Stay on this scene" ถ้าไม่ต้องการย้าย) DM คลิกจอเพื่อเปิดม่านก่อนเวลาได้

## Settings

- Colour theme — ดำแดง / ดำเทาขาว / ขาวม่วง / ดำน้ำเงิน (DM ตั้ง ใช้กับทุกคน)
- Name shown for players — ชื่อผู้เล่น หรือชื่อตัวละครที่ผูกไว้
- Curtain hold time — จอดำค้างกี่วินาที (0 = ค้างจนกว่า DM จะคลิก)
- Auto-clear signals after — ให้สัญญาณดับเองหลังกี่วินาที (0 = ค้างจนกดปิด)
- Ticker offset from top — เลื่อนแถบวิ่งลงมาถ้าบังอะไรบนจอ (เฉพาะเครื่องตัวเอง)

## แก้ข้อความ

ข้อความทั้งหมดอยู่ต้นไฟล์ `scripts/stage-pacer.js` ในตัวแปร `SIGNALS` และ `CURTAIN`

## ติดตั้ง

Manifest URL: `https://github.com/NuttoSGXX/stage-pacer/releases/latest/download/module.json`
(แนบ `module.json` และ `module.zip` ไว้ใน GitHub Release แท็ก `v0.1.0`)
