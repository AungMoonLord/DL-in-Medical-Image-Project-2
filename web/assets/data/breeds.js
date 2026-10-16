// Breed catalogue for web/data.html. Keys match data/class_mappings.py.
// "look" = what a person (and the model) can see in a photo; "alike" = breeds that are easy to mix up visually.
window.PET_BREEDS = [
  // ---------------- Cats (12) ----------------
  { key: "abyssinian", th: "อะบิสซิเนียน", species: "cat", origin: "อังกฤษ (ตั้งชื่อตามอะบิสซิเนีย/เอธิโอเปีย)",
    look: ["ขนสั้นแบบ ticked แต่ละเส้นมีหลายแถบสี ทำให้ทั้งตัวดูเป็นเนื้อเดียว ไม่มีลาย", "สีน้ำตาลอมแดงหรือสีอบเชย", "หูใหญ่ตั้ง ตัวเพรียว ขายาว"],
    alike: ["bengal", "egyptian_mau"] },
  { key: "bengal", th: "เบงกอล", species: "cat", origin: "สหรัฐอเมริกา (ผสมกับแมวดาว Asian leopard cat)",
    look: ["ลายจุดหรือลายดอก (rosette) แบบเสือดาวบนพื้นสีทองหรือเงิน", "ขนสั้นเงาวาว (glitter)", "ตัวยาว กล้ามเนื้อแน่น"],
    alike: ["egyptian_mau", "abyssinian"] },
  { key: "birman", th: "เบอร์แมน", species: "cat", origin: "เมียนมา (ตำนาน) พัฒนาสายพันธุ์ในฝรั่งเศส",
    look: ["Colorpoint: หน้า หู ขา หางสีเข้ม ตัวสีครีม", "อุ้งเท้าทั้งสี่ขาวเหมือนใส่ถุงมือ (จุดแยกจาก Ragdoll)", "ตาสีฟ้า ขนยาวปานกลาง"],
    alike: ["ragdoll", "siamese"] },
  { key: "bombay", th: "บอมเบย์", species: "cat", origin: "สหรัฐอเมริกา (Burmese × American Shorthair สีดำ)",
    look: ["ดำสนิททั้งตัว ขนสั้นเงาเหมือนเสือดำตัวเล็ก", "ตาสีทองแดงหรือเหลืองทองตัดกับขน", "หัวกลม"],
    alike: ["british_shorthair", "russian_blue"],
    note: "สีดำทั้งตัวทำให้มองรายละเอียดยาก และขอบกลืนกับพื้นหลังสีเข้ม" },
  { key: "british_shorthair", th: "บริติชชอร์ตแฮร์", species: "cat", origin: "อังกฤษ",
    look: ["ตัวอ้วนกลม หน้ากลม แก้มป่อง ขนแน่นเหมือนตุ๊กตาหมี", "สีที่เห็นบ่อยคือเทาอมฟ้า (blue) แต่มีได้หลายสี", "ตาสีทองแดงกลมโต"],
    alike: ["russian_blue", "persian"] },
  { key: "egyptian_mau", th: "อียิปต์เชียนเมา", species: "cat", origin: "อียิปต์",
    look: ["ลายจุดที่เกิดตามธรรมชาติ (ไม่ได้ผสมพันธุ์ให้เกิด)", "ลายรูปตัว M บนหน้าผาก ตาสีเขียวมะยม", "สีเงิน บรอนซ์ หรือ smoke"],
    alike: ["bengal", "abyssinian"] },
  { key: "maine_coon", th: "เมนคูน", species: "cat", origin: "สหรัฐอเมริกา (รัฐเมน)",
    look: ["แมวบ้านตัวใหญ่ที่สุดสายพันธุ์หนึ่ง", "ขนยาวหนา มีแผงคอ และหางฟูยาว", "ปลายหูมีพู่ (lynx tips)"],
    alike: ["persian", "ragdoll"] },
  { key: "persian", th: "เปอร์เซีย", species: "cat", origin: "อิหร่าน (เปอร์เซีย)",
    look: ["หน้าแบน จมูกสั้นมาก (brachycephalic)", "ขนยาวฟูมากทั้งตัว", "ตาโตกลม หูเล็กห่างกัน"],
    alike: ["maine_coon", "british_shorthair"],
    note: "ขนฟูทำให้เส้นขอบตัวไม่ชัด คลาสขอบจึงยาก" },
  { key: "ragdoll", th: "แร็กดอลล์", species: "cat", origin: "สหรัฐอเมริกา",
    look: ["Colorpoint ขนยาวกึ่ง ตาสีฟ้า ตัวใหญ่", "มีแบบขาวที่อุ้งเท้า (mitted) หรือขาวที่อกและหน้า (bicolor)", "ชื่อมาจากนิสัยตัวอ่อนปวกเปียกเมื่ออุ้ม"],
    alike: ["birman", "siamese"] },
  { key: "russian_blue", th: "รัสเซียนบลู", species: "cat", origin: "รัสเซีย",
    look: ["ขนสั้นสองชั้นสีเทาอมฟ้า ปลายขนสีเงิน", "ตาสีเขียว (ต่างจาก British Shorthair ที่ตาสีทองแดง)", "ตัวเพรียว หัวทรงลิ่ม"],
    alike: ["british_shorthair", "bombay"] },
  { key: "siamese", th: "วิเชียรมาศ (สยาม)", species: "cat", origin: "ประเทศไทย",
    look: ["Colorpoint: หน้า หู ขา หางสีเข้ม ตัวสีครีมอ่อน", "ตาสีฟ้า หัวทรงลิ่ม หูใหญ่", "ขนสั้นแนบตัว ตัวยาวเพรียว"],
    alike: ["birman", "ragdoll"],
    note: "สายพันธุ์เดียวในชุดข้อมูลที่มีต้นกำเนิดจากประเทศไทย" },
  { key: "sphynx", th: "สฟิงซ์", species: "cat", origin: "แคนาดา",
    look: ["แทบไม่มีขน เห็นผิวหนังและรอยย่น", "หูใหญ่มาก ตาโต", "ตัวผอม ผิวสีชมพูหรือมีลายสีบนผิว"],
    alike: ["chihuahua"],
    note: "ถูกทายข้ามเป็นหมา Chihuahua บ่อยที่สุดในบรรดาแมว เพราะตัวเล็ก หูใหญ่ ผิวเกลี้ยงเหมือนกัน" },

  // ---------------- Dogs (25) ----------------
  { key: "american_bulldog", th: "อเมริกันบูลด็อก", species: "dog", origin: "สหรัฐอเมริกา",
    look: ["ตัวใหญ่ กล้ามเนื้อหนา หัวกว้าง", "ขนสั้น ส่วนใหญ่สีขาวมีปื้นสี", "กรามแข็งแรง ปากไม่สั้นเท่าบูลด็อกอังกฤษ"],
    alike: ["american_pit_bull_terrier", "boxer", "staffordshire_bull_terrier"] },
  { key: "american_pit_bull_terrier", th: "อเมริกันพิตบูลเทอร์เรีย", species: "dog", origin: "สหรัฐอเมริกา",
    look: ["กล้ามเนื้อแน่น หัวกว้างแบน", "ขนสั้นเรียบ มีได้แทบทุกสี", "ตัวสูงและยาวกว่า Staffordshire เล็กน้อย"],
    alike: ["staffordshire_bull_terrier", "american_bulldog"],
    note: "คู่ที่สับสนมากที่สุดในงานนี้ ความต่างหลักคือขนาดตัว ซึ่งดูจากภาพเดี่ยวได้ยาก" },
  { key: "basset_hound", th: "บาสเซ็ตฮาวด์", species: "dog", origin: "ฝรั่งเศส",
    look: ["ขาสั้นมาก ตัวยาว", "หูยาวห้อยถึงพื้น หนังหน้าย่นหย่อน", "ส่วนใหญ่สามสี ขาว-ดำ-น้ำตาล"],
    alike: ["beagle"] },
  { key: "beagle", th: "บีเกิล", species: "dog", origin: "อังกฤษ",
    look: ["หมาล่ากลิ่นขนาดกลางเล็ก", "สามสี ขาว-ดำ-น้ำตาล ปลายหางขาว", "หูห้อยปานกลาง ขายาวกว่าบาสเซ็ต"],
    alike: ["basset_hound", "english_cocker_spaniel"] },
  { key: "boxer", th: "บ็อกเซอร์", species: "dog", origin: "เยอรมนี",
    look: ["หน้าสั้น ขากรรไกรล่างยื่น", "ขนสั้นสีน้ำตาลทองหรือลายเสือ มีหน้ากากดำ", "ตัวสูง อกลึก กล้ามเนื้อชัด"],
    alike: ["american_bulldog", "american_pit_bull_terrier"] },
  { key: "chihuahua", th: "ชิวาวา", species: "dog", origin: "เม็กซิโก",
    look: ["หมาตัวเล็กที่สุดสายพันธุ์หนึ่ง", "หัวทรงแอปเปิล หูใหญ่ตั้ง ตาโต", "มีทั้งขนสั้นและขนยาว"],
    alike: ["miniature_pinscher", "sphynx"] },
  { key: "english_cocker_spaniel", th: "อิงลิชค็อกเกอร์สแปเนียล", species: "dog", origin: "อังกฤษ",
    look: ["หูยาวห้อย ขนหูเป็นลอน", "ขนนุ่มยาวปานกลาง สีทอง ดำ หรือลายจุด", "หน้าอ่อนโยน ตัวกะทัดรัด"],
    alike: ["english_setter", "havanese"] },
  { key: "english_setter", th: "อิงลิชเซตเตอร์", species: "dog", origin: "อังกฤษ",
    look: ["ขนยาวลื่น สีขาวมีจุดกระเล็ก ๆ (belton)", "มีขนพู่ยาวที่ขา อก และหาง", "ตัวสูงเพรียว หัวยาว"],
    alike: ["english_cocker_spaniel", "german_shorthaired"] },
  { key: "german_shorthaired", th: "เยอรมันชอร์ตแฮร์พอยน์เตอร์", species: "dog", origin: "เยอรมนี",
    look: ["ขนสั้นแข็ง สีน้ำตาลตับล้วนหรือลายจุดขาว-น้ำตาล", "หูห้อย จมูกสีน้ำตาล", "ตัวเพรียว กล้ามเนื้อนักล่า"],
    alike: ["english_setter"] },
  { key: "great_pyrenees", th: "เกรตพีเรนีส", species: "dog", origin: "เทือกเขาพิเรนีส (ฝรั่งเศส–สเปน)",
    look: ["ตัวใหญ่มาก ขนขาวหนา", "หน้าคล้ายหมี หูห้อยเล็ก", "เดิมใช้เฝ้าฝูงแกะบนภูเขา"],
    alike: ["samoyed", "leonberger"] },
  { key: "havanese", th: "ฮาวานีส", species: "dog", origin: "คิวบา",
    look: ["ตัวเล็ก ขนยาวนุ่มเป็นลอน", "มีหลายสี", "หางม้วนพาดหลัง"],
    alike: ["yorkshire_terrier", "english_cocker_spaniel", "japanese_chin"] },
  { key: "japanese_chin", th: "เจแปนนิสชิน", species: "dog", origin: "ญี่ปุ่น (บรรพบุรุษจากจีน)",
    look: ["หน้าแบน ตาโตห่างกัน", "ส่วนใหญ่ขาว-ดำ ขนยาวนุ่ม", "ตัวเล็ก หัวกลมใหญ่เมื่อเทียบกับตัว"],
    alike: ["havanese", "pug"] },
  { key: "keeshond", th: "คีชอนด์", species: "dog", origin: "เนเธอร์แลนด์",
    look: ["หมาตระกูลสปิตซ์ ขนฟูหนาสีเทาเงินปนดำ", "มีลายรอบตาเหมือนใส่แว่น", "หางม้วนฟูพาดหลัง"],
    alike: ["pomeranian", "samoyed", "leonberger"] },
  { key: "leonberger", th: "เลออนเบอร์เกอร์", species: "dog", origin: "เยอรมนี",
    look: ["ตัวยักษ์ ขนยาวสีทองถึงน้ำตาลแดง", "หน้ากากดำ", "แผงคอหนาเหมือนสิงโต"],
    alike: ["newfoundland", "saint_bernard", "keeshond"] },
  { key: "miniature_pinscher", th: "มินิเอเจอร์พินเชอร์", species: "dog", origin: "เยอรมนี",
    look: ["ตัวเล็ก ขนสั้นเรียบ ส่วนใหญ่ดำ-น้ำตาล", "หูตั้ง ท่ายืนสง่า", "รูปร่างเหมือนโดเบอร์แมนย่อส่วน (แต่ไม่ใช่สายพันธุ์ย่อของกัน)"],
    alike: ["chihuahua"] },
  { key: "newfoundland", th: "นิวฟันด์แลนด์", species: "dog", origin: "แคนาดา (เกาะนิวฟันด์แลนด์)",
    look: ["ตัวยักษ์ ขนหนาสีดำ น้ำตาล หรือขาว-ดำ", "ขนกันน้ำ เดิมใช้กู้ภัยทางน้ำ", "หัวใหญ่กว้าง"],
    alike: ["leonberger", "saint_bernard"],
    note: "ขนดำหนาทำให้รายละเอียดหายไปในเงา คล้ายกรณีแมว Bombay" },
  { key: "pomeranian", th: "ปอมเมอเรเนียน", species: "dog", origin: "แคว้นพอเมอเรเนีย (เยอรมนี–โปแลนด์)",
    look: ["หมาสปิตซ์จิ๋ว ขนฟูมากเป็นก้อน", "หน้าแหลมเหมือนสุนัขจิ้งจอก", "หางม้วนพาดหลัง"],
    alike: ["keeshond", "samoyed"] },
  { key: "pug", th: "ปั๊ก", species: "dog", origin: "จีน",
    look: ["หน้าแบนย่น หน้ากากดำ", "ตัวกลมกะทัดรัด ขนสั้น", "หางม้วนเป็นวง"],
    alike: ["boxer", "japanese_chin"] },
  { key: "saint_bernard", th: "เซนต์เบอร์นาร์ด", species: "dog", origin: "สวิตเซอร์แลนด์",
    look: ["ตัวยักษ์ สีขาวกับน้ำตาลแดง", "หน้ากากสีเข้มรอบตา", "เดิมใช้กู้ภัยในหิมะบนเทือกเขาแอลป์"],
    alike: ["leonberger", "newfoundland"] },
  { key: "samoyed", th: "ซามอยด์", species: "dog", origin: "ไซบีเรีย (รัสเซีย)",
    look: ["หมาสปิตซ์ขนขาวฟูทั้งตัว", "มุมปากยกขึ้นเหมือนยิ้ม (Samoyed smile)", "หางม้วนพาดหลัง"],
    alike: ["great_pyrenees", "pomeranian", "keeshond"] },
  { key: "scottish_terrier", th: "สก็อตติชเทอร์เรีย", species: "dog", origin: "สกอตแลนด์",
    look: ["ขาสั้น ตัวเตี้ยยาว", "ขนแข็ง ส่วนใหญ่สีดำ", "เคราและคิ้วยาวชัดเจน"],
    alike: ["wheaten_terrier", "yorkshire_terrier"] },
  { key: "shiba_inu", th: "ชิบะอินุ", species: "dog", origin: "ญี่ปุ่น",
    look: ["หมาสปิตซ์ขนาดกลางเล็ก สีแดง งา หรือดำ-น้ำตาล", "ขนขาวใต้คาง อก และแก้ม (urajiro)", "หูตั้งสามเหลี่ยม หางม้วน"],
    alike: ["pomeranian", "keeshond"],
    note: "ภาพหมาอากิตะ (ไม่มีในชุดข้อมูล) ถูกทายเป็นชิบะด้วยความมั่นใจ 97.6%" },
  { key: "staffordshire_bull_terrier", th: "สแตฟฟอร์ดเชียร์บูลเทอร์เรีย", species: "dog", origin: "อังกฤษ",
    look: ["ตัวเตี้ยกว่าพิตบูล กล้ามเนื้อแน่น", "หัวกว้าง แก้มเด่นชัด", "ขนสั้นเรียบ หลายสี"],
    alike: ["american_pit_bull_terrier", "american_bulldog"] },
  { key: "wheaten_terrier", th: "(ซอฟต์โค้ต) วีทเทนเทอร์เรีย", species: "dog", origin: "ไอร์แลนด์",
    look: ["ขนนุ่มเป็นลอนสีข้าวสาลี", "ขนคลุมหน้าและตา", "ตัวขนาดกลาง สี่เหลี่ยม"],
    alike: ["havanese", "scottish_terrier"] },
  { key: "yorkshire_terrier", th: "ยอร์กเชียร์เทอร์เรีย", species: "dog", origin: "อังกฤษ",
    look: ["ตัวจิ๋ว ขนยาวตรงเงาลื่น", "สีน้ำเงินเหล็กที่ตัว น้ำตาลทองที่หัวและขา", "มักมัดจุกหรือติดโบว์บนหัว"],
    alike: ["havanese", "scottish_terrier"] },
];

// Source pages for each dataset breed (verified 2026-10-16): breed registries (AKC/UKC for dogs, CFA for cats) and Wikipedia.
window.PET_SOURCES = {
 "abyssinian": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Abyssinian_cat"
  ],
  [
   "CFA",
   "https://cfa.org/breed/abyssinian/"
  ]
 ],
 "bengal": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Bengal_cat"
  ],
  [
   "CFA",
   "https://cfa.org/breed/bengal/"
  ]
 ],
 "birman": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Birman"
  ],
  [
   "CFA",
   "https://cfa.org/breed/birman/"
  ]
 ],
 "bombay": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Bombay_cat"
  ],
  [
   "CFA",
   "https://cfa.org/breed/bombay/"
  ]
 ],
 "british_shorthair": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/British_Shorthair"
  ],
  [
   "CFA",
   "https://cfa.org/breed/british-shorthair/"
  ]
 ],
 "egyptian_mau": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Egyptian_Mau"
  ],
  [
   "CFA",
   "https://cfa.org/breed/egyptian-mau/"
  ]
 ],
 "maine_coon": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Maine_Coon"
  ],
  [
   "CFA",
   "https://cfa.org/breed/maine-coon-cat/"
  ]
 ],
 "persian": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Persian_cat"
  ],
  [
   "CFA",
   "https://cfa.org/breed/persian/"
  ]
 ],
 "ragdoll": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Ragdoll"
  ],
  [
   "CFA",
   "https://cfa.org/breed/ragdoll/"
  ]
 ],
 "russian_blue": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Russian_Blue"
  ],
  [
   "CFA",
   "https://cfa.org/breed/russian-blue/"
  ]
 ],
 "siamese": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Siamese_cat"
  ],
  [
   "CFA",
   "https://cfa.org/breed/siamese/"
  ]
 ],
 "sphynx": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Sphynx_cat"
  ],
  [
   "CFA",
   "https://cfa.org/breed/sphynx/"
  ]
 ],
 "american_bulldog": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/American_Bulldog"
  ],
  [
   "UKC",
   "https://www.ukcdogs.com/american-bulldog"
  ]
 ],
 "american_pit_bull_terrier": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/American_Pit_Bull_Terrier"
  ],
  [
   "UKC",
   "https://www.ukcdogs.com/american-pit-bull-terrier"
  ]
 ],
 "basset_hound": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Basset_Hound"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/basset-hound/"
  ]
 ],
 "beagle": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Beagle"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/beagle/"
  ]
 ],
 "boxer": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Boxer_(dog)"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/boxer/"
  ]
 ],
 "chihuahua": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Chihuahua_(dog)"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/chihuahua/"
  ]
 ],
 "english_cocker_spaniel": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/English_Cocker_Spaniel"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/english-cocker-spaniel/"
  ]
 ],
 "english_setter": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/English_Setter"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/english-setter/"
  ]
 ],
 "german_shorthaired": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/German_Shorthaired_Pointer"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/german-shorthaired-pointer/"
  ]
 ],
 "great_pyrenees": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Great_Pyrenees"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/great-pyrenees/"
  ]
 ],
 "havanese": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Havanese_dog"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/havanese/"
  ]
 ],
 "japanese_chin": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Japanese_Chin"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/japanese-chin/"
  ]
 ],
 "keeshond": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Keeshond"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/keeshond/"
  ]
 ],
 "leonberger": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Leonberger"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/leonberger/"
  ]
 ],
 "miniature_pinscher": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Miniature_Pinscher"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/miniature-pinscher/"
  ]
 ],
 "newfoundland": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Newfoundland_dog"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/newfoundland/"
  ]
 ],
 "pomeranian": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Pomeranian_dog"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/pomeranian/"
  ]
 ],
 "pug": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Pug"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/pug/"
  ]
 ],
 "saint_bernard": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/St._Bernard_(dog)"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/st-bernard/"
  ]
 ],
 "samoyed": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Samoyed_dog"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/samoyed/"
  ]
 ],
 "scottish_terrier": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Scottish_Terrier"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/scottish-terrier/"
  ]
 ],
 "shiba_inu": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Shiba_Inu"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/shiba-inu/"
  ]
 ],
 "staffordshire_bull_terrier": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Staffordshire_Bull_Terrier"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/staffordshire-bull-terrier/"
  ]
 ],
 "wheaten_terrier": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Soft-coated_Wheaten_Terrier"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/soft-coated-wheaten-terrier/"
  ]
 ],
 "yorkshire_terrier": [
  [
   "Wikipedia",
   "https://en.wikipedia.org/wiki/Yorkshire_Terrier"
  ],
  [
   "AKC",
   "https://www.akc.org/dog-breeds/yorkshire-terrier/"
  ]
 ]
};

// Look-alike breeds that are NOT in Oxford-IIIT Pet. The model has never seen them and will map them to one of the 37 classes.
window.PET_REFERENCE = [
 {
  "key": "x_akita",
  "name": "Akita",
  "th": "อากิตะ",
  "species": "dog",
  "origin": "ญี่ปุ่น",
  "alike": [
   "shiba_inu"
  ],
  "look": "ตัวใหญ่กว่าชิบะมาก หัวกว้างเป็นสามเหลี่ยม หางม้วนหนาพาดหลัง",
  "why": "ใน notebook ภาพอากิตะถูกทายเป็นชิบะด้วยความมั่นใจ 97.6% เป็นตัวอย่างชัดของปัญหา closed-set",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Akita_(dog)"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/akita/"
   ]
  ]
 },
 {
  "key": "x_husky",
  "name": "Siberian Husky",
  "th": "ไซบีเรียนฮัสกี",
  "species": "dog",
  "origin": "ไซบีเรีย (รัสเซีย)",
  "alike": [
   "keeshond",
   "samoyed"
  ],
  "look": "หน้ากากขาวตัดเทาหรือดำ ตาสีฟ้าหรือสองสี หูตั้ง หางฟู",
  "why": "สปิตซ์ขนฟูเหมือนกัน แต่ลายหน้าต่างจาก Keeshond และ Samoyed",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Siberian_Husky"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/siberian-husky/"
   ]
  ]
 },
 {
  "key": "x_amstaff",
  "name": "American Staffordshire Terrier",
  "th": "อเมริกันสแตฟฟอร์ดเชียร์เทอร์เรีย",
  "species": "dog",
  "origin": "สหรัฐอเมริกา",
  "alike": [
   "american_pit_bull_terrier",
   "staffordshire_bull_terrier"
  ],
  "look": "สายเลือดเดียวกับพิตบูล แต่ขึ้นทะเบียนกับ AKC ขนาดอยู่ระหว่างพิตบูลกับสแตฟฟอร์ดเชียร์",
  "why": "คู่ที่โมเดลสับสนมากที่สุดอยู่ในตระกูลนี้ ถ้ามีภาพ AmStaff เข้ามาจะยิ่งแยกยาก",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/American_Staffordshire_Terrier"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/american-staffordshire-terrier/"
   ]
  ]
 },
 {
  "key": "x_frenchie",
  "name": "French Bulldog",
  "th": "เฟรนช์บูลด็อก",
  "species": "dog",
  "origin": "ฝรั่งเศส",
  "alike": [
   "pug",
   "boxer"
  ],
  "look": "หน้าสั้นย่น หูตั้งทรงค้างคาว ตัวเล็กล่ำ",
  "why": "หน้าแบนและหน้ากากเข้มคล้าย Pug กับ Boxer",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/French_Bulldog"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/french-bulldog/"
   ]
  ]
 },
 {
  "key": "x_doberman",
  "name": "Doberman Pinscher",
  "th": "โดเบอร์แมน",
  "species": "dog",
  "origin": "เยอรมนี",
  "alike": [
   "miniature_pinscher"
  ],
  "look": "ตัวใหญ่ สูงเพรียว ดำ-น้ำตาล หูตั้ง",
  "why": "Min Pin หน้าตาคล้ายโดเบอร์แมนย่อส่วน แต่ไม่ได้มาจากสายพันธุ์เดียวกัน ภาพเดี่ยวที่ไม่มีวัตถุอ้างอิงขนาดจึงสับสนได้",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Dobermann"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/doberman-pinscher/"
   ]
  ]
 },
 {
  "key": "x_bernese",
  "name": "Bernese Mountain Dog",
  "th": "เบอร์นีสเมาน์เทนด็อก",
  "species": "dog",
  "origin": "สวิตเซอร์แลนด์",
  "alike": [
   "saint_bernard",
   "leonberger"
  ],
  "look": "สามสี ดำ-ขาว-น้ำตาลสนิม ขนยาวปานกลาง",
  "why": "หมายักษ์จากเทือกเขาแอลป์เหมือน Saint Bernard แต่พื้นสีดำ",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Bernese_Mountain_Dog"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/bernese-mountain-dog/"
   ]
  ]
 },
 {
  "key": "x_shihtzu",
  "name": "Shih Tzu",
  "th": "ชิสุ",
  "species": "dog",
  "origin": "ทิเบต / จีน",
  "alike": [
   "havanese",
   "japanese_chin"
  ],
  "look": "หน้าสั้น ขนยาวลื่นคลุมตัว มักมัดจุก",
  "why": "ขนยาวตัวเล็กเหมือน Havanese แต่หน้าสั้นกว่า",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Shih_Tzu"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/shih-tzu/"
   ]
  ]
 },
 {
  "key": "x_pekingese",
  "name": "Pekingese",
  "th": "ปักกิ่ง",
  "species": "dog",
  "origin": "จีน",
  "alike": [
   "japanese_chin",
   "pug"
  ],
  "look": "หน้าแบน ขนยาวหนาเป็นแผงที่คอ ขาสั้น",
  "why": "หน้าแบนตาโตคล้าย Japanese Chin",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Pekingese"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/pekingese/"
   ]
  ]
 },
 {
  "key": "x_westie",
  "name": "West Highland White Terrier",
  "th": "เวสต์ไฮแลนด์ไวต์เทอร์เรีย (เวสตี้)",
  "species": "dog",
  "origin": "สกอตแลนด์",
  "alike": [
   "scottish_terrier",
   "wheaten_terrier"
  ],
  "look": "ขาวทั้งตัว ขนแข็ง หูตั้ง หน้ากลม",
  "why": "ญาติใกล้ของ Scottish Terrier ซึ่งมีสีวีทเทน (ครีมอ่อน) ด้วย ภาพสก็อตตี้สีอ่อนจึงดูคล้ายเวสตี้",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/West_Highland_White_Terrier"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/west-highland-white-terrier/"
   ]
  ]
 },
 {
  "key": "x_cavalier",
  "name": "Cavalier King Charles Spaniel",
  "th": "คาวาเลียร์คิงชาลส์สแปเนียล",
  "species": "dog",
  "origin": "อังกฤษ",
  "alike": [
   "english_cocker_spaniel",
   "japanese_chin"
  ],
  "look": "หูยาวห้อยเป็นพู่ ตาโตกลม ตัวเล็ก",
  "why": "หูแบบสแปเนียลเหมือน Cocker และสี ขาว-แดงคล้าย Japanese Chin",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Cavalier_King_Charles_Spaniel"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/cavalier-king-charles-spaniel/"
   ]
  ]
 },
 {
  "key": "x_golden",
  "name": "Golden Retriever",
  "th": "โกลเดนรีทรีฟเวอร์",
  "species": "dog",
  "origin": "สกอตแลนด์",
  "alike": [
   "leonberger",
   "english_setter"
  ],
  "look": "ขนยาวสีทอง หน้าอ่อนโยน ไม่มีหน้ากากดำ",
  "why": "หมายอดนิยมที่ไม่มีในชุดข้อมูล ขนยาวสีทองคล้าย Leonberger โมเดลจะต้องทายเป็นหนึ่งใน 37 สายพันธุ์เสมอ",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Golden_Retriever"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/golden-retriever/"
   ]
  ]
 },
 {
  "key": "x_thai_ridgeback",
  "name": "Thai Ridgeback",
  "th": "ไทยหลังอาน",
  "species": "dog",
  "origin": "ประเทศไทย",
  "alike": [],
  "look": "ขนสั้นสีเรียบ (แดง ดำ น้ำเงิน หรือเทาอ่อน) มีแนวขนย้อนทิศเป็นสันกลางหลัง",
  "why": "สายพันธุ์ไทย ไม่มีสายพันธุ์ใดในชุดข้อมูลที่คล้ายชัดเจน เป็นตัวอย่างที่ดีของภาพนอกคลาส",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Thai_Ridgeback"
   ],
   [
    "AKC",
    "https://www.akc.org/dog-breeds/thai-ridgeback/"
   ]
  ]
 },
 {
  "key": "x_bangkaew",
  "name": "Thai Bangkaew Dog",
  "th": "บางแก้ว",
  "species": "dog",
  "origin": "ประเทศไทย (พิษณุโลก)",
  "alike": [
   "keeshond",
   "samoyed"
  ],
  "look": "หมาสปิตซ์ขนาดกลาง ขนหนาสองชั้น พื้นขาวมีปื้นสี แผงคอฟู",
  "why": "สายพันธุ์ไทย รูปร่างแบบสปิตซ์ใกล้กับ Keeshond และ Samoyed",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Thai_Bangkaew_Dog"
   ]
  ]
 },
 {
  "key": "x_himalayan",
  "name": "Himalayan",
  "th": "หิมาลายัน",
  "species": "cat",
  "origin": "สหรัฐอเมริกา / อังกฤษ",
  "alike": [
   "persian",
   "birman"
  ],
  "look": "รูปร่างและหน้าแบบเปอร์เซีย แต่เป็น colorpoint ตาสีฟ้า",
  "why": "รวมลักษณะของ Persian (หน้าแบน ขนยาว) กับแต้มสีแบบ Birman",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Himalayan_cat"
   ]
  ]
 },
 {
  "key": "x_savannah",
  "name": "Savannah",
  "th": "ซาวันนา",
  "species": "cat",
  "origin": "สหรัฐอเมริกา (ผสมกับเซอร์วัล)",
  "alike": [
   "bengal",
   "egyptian_mau"
  ],
  "look": "ตัวสูง ขายาว หูใหญ่มาก ลายจุดดำบนพื้นทอง",
  "why": "แมวลายจุดแบบเดียวกับ Bengal แต่สัดส่วนตัวต่างมาก",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Savannah_cat"
   ]
  ]
 },
 {
  "key": "x_ocicat",
  "name": "Ocicat",
  "th": "โอซิแคต",
  "species": "cat",
  "origin": "สหรัฐอเมริกา",
  "alike": [
   "egyptian_mau",
   "bengal"
  ],
  "look": "ลายจุดชัดทั้งตัว แต่ไม่มีเลือดแมวป่า",
  "why": "ลายจุดคล้าย Egyptian Mau ซึ่งเป็นคู่สับสนอันดับ 2 ของโมเดล",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Ocicat"
   ],
   [
    "CFA",
    "https://cfa.org/breed/ocicat/"
   ]
  ]
 },
 {
  "key": "x_somali",
  "name": "Somali",
  "th": "โซมาลี",
  "species": "cat",
  "origin": "สหรัฐอเมริกา / แคนาดา",
  "alike": [
   "abyssinian"
  ],
  "look": "Abyssinian ขนยาว ขน ticked สีแดงอบเชย หางฟู",
  "why": "แทบเป็นสายพันธุ์เดียวกับ Abyssinian ต่างที่ความยาวขน",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Somali_cat"
   ],
   [
    "CFA",
    "https://cfa.org/breed/somali/"
   ]
  ]
 },
 {
  "key": "x_chartreux",
  "name": "Chartreux",
  "th": "ชาร์ทรู",
  "species": "cat",
  "origin": "ฝรั่งเศส",
  "alike": [
   "british_shorthair",
   "russian_blue"
  ],
  "look": "ขนสั้นหนาสีเทาอมฟ้า ตาสีทองแดงถึงส้ม ตัวล่ำ",
  "why": "สีเดียวกับ British Shorthair และ Russian Blue ต้องดูสีตาและรูปหน้า",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Chartreux"
   ],
   [
    "CFA",
    "https://cfa.org/breed/chartreux/"
   ]
  ]
 },
 {
  "key": "x_korat",
  "name": "Korat",
  "th": "โคราช (สีสวาด / มาเลศ)",
  "species": "cat",
  "origin": "ประเทศไทย",
  "alike": [
   "russian_blue"
  ],
  "look": "ขนสั้นสีเทาอมฟ้าปลายขนเงิน ตาเขียว หัวทรงหัวใจ",
  "why": "แมวไทยที่หน้าตาใกล้ Russian Blue มากที่สุด",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Korat"
   ],
   [
    "CFA",
    "https://cfa.org/breed/korat/"
   ]
  ]
 },
 {
  "key": "x_burmese",
  "name": "Burmese",
  "th": "เบอร์มีส",
  "species": "cat",
  "origin": "สหรัฐอเมริกา (บรรพบุรุษจากเมียนมา)",
  "alike": [
   "bombay"
  ],
  "look": "ขนสั้นเงา สีน้ำตาลเข้ม (sable) ตาสีทอง ตัวกลมล่ำ",
  "why": "Bombay ถูกพัฒนาจาก Burmese ผสมแมวขนสั้นสีดำ",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Burmese_cat"
   ],
   [
    "CFA",
    "https://cfa.org/breed/burmese/"
   ]
  ]
 },
 {
  "key": "x_peterbald",
  "name": "Peterbald",
  "th": "ปีเตอร์บอลด์",
  "species": "cat",
  "origin": "รัสเซีย",
  "alike": [
   "sphynx"
  ],
  "look": "ไม่มีขนหรือขนสั้นมาก รูปร่างเพรียวแบบโอเรียนทัล หูใหญ่",
  "why": "แมวไม่มีขนเหมือน Sphynx แต่ตัวยาวเพรียวกว่า",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Peterbald"
   ]
  ]
 },
 {
  "key": "x_balinese",
  "name": "Balinese",
  "th": "บาลินีส",
  "species": "cat",
  "origin": "สหรัฐอเมริกา",
  "alike": [
   "siamese",
   "birman"
  ],
  "look": "Siamese ขนยาว colorpoint ตาสีฟ้า หางเป็นพู่",
  "why": "ต่างจาก Siamese แค่ความยาวขน และใกล้ Birman ที่ไม่มีอุ้งเท้าขาว",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Balinese_cat"
   ],
   [
    "CFA",
    "https://cfa.org/breed/balinese/"
   ]
  ]
 },
 {
  "key": "x_khaomanee",
  "name": "Khao Manee",
  "th": "ขาวมณี",
  "species": "cat",
  "origin": "ประเทศไทย",
  "alike": [],
  "look": "ขาวล้วนทั้งตัว ขนสั้น มักมีตาสองสี (odd-eyed)",
  "why": "แมวไทย ไม่มีสายพันธุ์ใดในชุดข้อมูลที่เป็นแมวขาวล้วน โมเดลจึงต้องเดาจากรูปร่าง",
  "src": [
   [
    "Wikipedia",
    "https://en.wikipedia.org/wiki/Khao_Manee"
   ]
  ]
 }
];
