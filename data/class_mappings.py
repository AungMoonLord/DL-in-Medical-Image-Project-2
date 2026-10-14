# แมปปิ้ง 37 สายพันธุ์ของ Oxford-IIIT Pet Dataset
BREED_NAMES = [
    "abyssinian", "american_bulldog", "american_pit_bull_terrier", "basset_hound",
    "beagle", "bengal", "birman", "bombay", "boxer", "british_shorthair",
    "chihuahua", "egyptian_mau", "english_cocker_spaniel", "english_setter",
    "german_shorthaired", "great_pyrenees", "havanese", "japanese_chin",
    "keeshond", "leonberger", "maine_coon", "miniature_pinscher", "newfoundland",
    "persian", "pomeranian", "pug", "ragdoll", "russian_blue", "saint_bernard",
    "samoyed", "scottish_terrier", "shiba_inu", "siamese", "sphynx",
    "staffordshire_bull_terrier", "wheaten_terrier", "yorkshire_terrier"
]

# 12 สายพันธุ์แมวในชุดข้อมูล
CAT_BREEDS = {
    "abyssinian", "bengal", "birman", "bombay", "british_shorthair",
    "egyptian_mau", "maine_coon", "persian", "ragdoll", "russian_blue",
    "siamese", "sphynx"
}

def get_species_id(breed_id: int) -> int:
    """แปลง breed_id (0..36) เป็น species_id (0: Cat, 1: Dog)"""
    breed_name = BREED_NAMES[breed_id]
    return 0 if breed_name in CAT_BREEDS else 1
