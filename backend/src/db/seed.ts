import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import { db, migrate } from "./index.js";

interface SeedChapter {
  titleEn: string;
  titleUr: string;
  contentEn: string;
  contentUr: string;
}

interface SeedQuestion {
  promptEn: string;
  promptUr: string;
  optionsEn: string[];
  optionsUr: string[];
  correctIndex: number;
}

interface SeedBook {
  titleEn: string;
  titleUr: string;
  subjectEn: string;
  subjectUr: string;
  grade: number;
  board: string;
  author: string;
  descriptionEn: string;
  descriptionUr: string;
  coverColor: string;
  /** Filename inside the PDF content directory for PDF-backed books. */
  pdfFile?: string;
  chapters: SeedChapter[];
  quiz?: { titleEn: string; titleUr: string; questions: SeedQuestion[] };
}

const books: SeedBook[] = [
  {
    titleEn: "General Science 5",
    titleUr: "\u062c\u0646\u0631\u0644 \u0633\u0627\u0626\u0646\u0633 \u06f5",
    subjectEn: "Science",
    subjectUr: "\u0633\u0627\u0626\u0646\u0633",
    grade: 5,
    board: "PTB",
    author: "Punjab Textbook Board",
    descriptionEn:
      "An introduction to living things, plants, and our solar system for Grade 5 students.",
    descriptionUr:
      "\u062c\u0645\u0627\u0639\u062a \u067e\u0646\u062c\u0645 \u06a9\u06d2 \u0637\u0644\u0628\u0627\u0621 \u06a9\u06d2 \u0644\u06cc\u06d2 \u062c\u0627\u0646\u062f\u0627\u0631\u0648\u06ba\u060c \u067e\u0648\u062f\u0648\u06ba \u0627\u0648\u0631 \u0646\u0638\u0627\u0645 \u0634\u0645\u0633\u06cc \u06a9\u0627 \u062a\u0639\u0627\u0631\u0641\u06d4",
    coverColor: "#16a34a",
    chapters: [
      {
        titleEn: "Living and Non-living Things",
        titleUr: "\u062c\u0627\u0646\u062f\u0627\u0631 \u0627\u0648\u0631 \u0628\u06d2 \u062c\u0627\u0646 \u0627\u0634\u06cc\u0627\u0621",
        contentEn:
          "Everything around us is either living or non-living. Living things can grow, breathe, move, reproduce, and respond to changes in their surroundings. Plants, animals, and human beings are all living things, while rocks, water, and air are examples of non-living things.\n\nAll living things share some important features. They need food and water to get energy, they take in air to breathe, and they slowly grow from small to large. Living things can also produce young ones of their own kind, which we call reproduction, and they sense and react to light, heat, sound, and danger.\n\nNon-living things do not eat, grow, or reproduce, and they cannot feel anything. Even so, some non-living things such as air, water, and sunlight are very important because no living thing can survive without them. Scientists study both living and non-living things to understand how nature stays in balance.",
        contentUr:
          "ہمارے ارد گرد ہر چیز یا تو جاندار ہے یا بے جان۔ جاندار اشیاء بڑھ سکتی ہیں، سانس لیتی ہیں، حرکت کرتی ہیں، اپنی نسل بڑھاتی ہیں اور اپنے ماحول میں تبدیلیوں کا جواب دیتی ہیں۔ پودے، جانور اور انسان سب جاندار ہیں جبکہ پتھر، پانی اور ہوا بے جان چیزوں کی مثالیں ہیں۔\n\nتمام جانداروں میں چند مشترک خصوصیات ہوتی ہیں۔ انہیں توانائی کے لیے خوراک اور پانی کی ضرورت ہوتی ہے، وہ سانس لینے کے لیے ہوا لیتے ہیں اور آہستہ آہستہ چھوٹے سے بڑے ہوتے ہیں۔ جاندار اپنی جیسی نئی نسل بھی پیدا کرتے ہیں جسے تولید کہتے ہیں اور وہ روشنی، حرارت، آواز اور خطرے کو محسوس کر کے ردِعمل ظاہر کرتے ہیں۔\n\nبے جان چیزیں نہ کھاتی ہیں، نہ بڑھتی ہیں اور نہ ہی کچھ محسوس کرتی ہیں۔ پھر بھی ہوا، پانی اور سورج کی روشنی جیسی کچھ بے جان چیزیں بہت اہم ہیں کیونکہ ان کے بغیر کوئی جاندار زندہ نہیں رہ سکتا۔ سائنسدان جانداروں اور بے جان چیزوں دونوں کا مطالعہ کرتے ہیں تاکہ سمجھ سکیں کہ قدرت میں توازن کیسے قائم رہتا ہے۔",
      },
      {
        titleEn: "Photosynthesis",
        titleUr: "\u0636\u06cc\u0627\u0626\u06cc \u062a\u0631\u06a9\u06cc\u0628",
        contentEn:
          "Photosynthesis is the process by which green plants make their own food. Plants use sunlight, water, and carbon dioxide from the air to produce a sugar called glucose, and they release oxygen as a by-product.\n\nThe green colour in leaves comes from a pigment called chlorophyll, which captures the energy in sunlight. Most photosynthesis happens inside the leaves, where tiny openings let air move in and out while the roots supply water drawn from the soil.\n\nThis process is very important for life on Earth. It gives plants the energy they need to grow, and it provides food for the animals and humans who eat plants. Just as importantly, photosynthesis adds oxygen to the air that almost all living things need to breathe.",
        contentUr:
          "ضیائی ترکیب وہ عمل ہے جس کے ذریعے سبز پودے اپنی خوراک خود بناتے ہیں۔ پودے سورج کی روشنی، پانی اور ہوا میں موجود کاربن ڈائی آکسائیڈ کو استعمال کر کے گلوکوز نامی شکر بناتے ہیں اور آکسیجن خارج کرتے ہیں۔\n\nپتوں کا سبز رنگ کلوروفل نامی مادے کی وجہ سے ہوتا ہے جو سورج کی روشنی کی توانائی کو پکڑتا ہے۔ زیادہ تر ضیائی ترکیب پتوں کے اندر ہوتی ہے جہاں ننھے سوراخ ہوا کو اندر باہر آنے دیتے ہیں اور جڑیں مٹی سے پانی فراہم کرتی ہیں۔\n\nیہ عمل زمین پر زندگی کے لیے بہت اہم ہے۔ یہ پودوں کو بڑھنے کی توانائی دیتا ہے، پودے کھانے والے جانوروں اور انسانوں کو خوراک مہیا کرتا ہے اور ہوا میں وہ آکسیجن شامل کرتا ہے جو تقریباً تمام جانداروں کو سانس لینے کے لیے درکار ہوتی ہے۔",
      },
      {
        titleEn: "The Solar System",
        titleUr: "\u0646\u0638\u0627\u0645 \u0634\u0645\u0633\u06cc",
        contentEn:
          "The solar system is made up of the Sun and the eight planets that move around it. In order from the Sun, the planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.\n\nThe Sun is a star and is by far the largest object in the solar system. Its gravity holds the planets in their paths, and its light and heat make life on Earth possible. Each planet travels around the Sun along a fixed path called an orbit.\n\nEarth is the only planet known to support life because it has air, water, and a comfortable temperature. Moons, such as our own Moon, orbit many of the planets, while smaller objects like asteroids and comets also travel through the solar system.",
        contentUr:
          "نظامِ شمسی سورج اور اس کے گرد گھومنے والے آٹھ سیاروں پر مشتمل ہے۔ سورج سے ترتیب کے لحاظ سے یہ سیارے عطارد، زہرہ، زمین، مریخ، مشتری، زحل، یورینس اور نیپچون ہیں۔\n\nسورج ایک ستارہ ہے اور نظامِ شمسی کی سب سے بڑی چیز ہے۔ اس کی کششِ ثقل سیاروں کو ان کے راستوں پر قائم رکھتی ہے اور اس کی روشنی اور حرارت زمین پر زندگی کو ممکن بناتی ہے۔ ہر سیارہ سورج کے گرد ایک مقررہ راستے پر گھومتا ہے جسے مدار کہتے ہیں۔\n\nزمین واحد سیارہ ہے جہاں زندگی موجود ہے کیونکہ یہاں ہوا، پانی اور مناسب درجہ حرارت موجود ہے۔ ہمارے چاند کی طرح بہت سے سیاروں کے اپنے چاند بھی ہوتے ہیں جبکہ سیارچے اور دمدار ستارے جیسی چھوٹی اشیاء بھی نظامِ شمسی میں سفر کرتی ہیں۔",
      },
    ],
    quiz: {
      titleEn: "Science Quiz: Plants & Space",
      titleUr: "\u0633\u0627\u0626\u0646\u0633 \u06a9\u0648\u0626\u0632",
      questions: [
        {
          promptEn: "Which gas do plants release during photosynthesis?",
          promptUr: "\u0636\u06cc\u0627\u0626\u06cc \u062a\u0631\u06a9\u06cc\u0628 \u06a9\u06d2 \u062f\u0648\u0631\u0627\u0646 \u067e\u0648\u062f\u06d2 \u06a9\u0648\u0646 \u0633\u06cc \u06af\u06cc\u0633 \u062e\u0627\u0631\u062c \u06a9\u0631\u062a\u06d2 \u06c1\u06cc\u06ba\u061f",
          optionsEn: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
          optionsUr: [
            "\u06a9\u0627\u0631\u0628\u0646 \u0688\u0627\u0626\u06cc \u0622\u06a9\u0633\u0627\u0626\u06cc\u0688",
            "\u0622\u06a9\u0633\u06cc\u062c\u0646",
            "\u0646\u0627\u0626\u0679\u0631\u0648\u062c\u0646",
            "\u06c1\u0627\u0626\u06cc\u0688\u0631\u0648\u062c\u0646",
          ],
          correctIndex: 1,
        },
        {
          promptEn: "How many planets are there in the solar system?",
          promptUr: "\u0646\u0638\u0627\u0645 \u0634\u0645\u0633\u06cc \u0645\u06cc\u06ba \u06a9\u062a\u0646\u06d2 \u0633\u06cc\u0627\u0631\u06d2 \u06c1\u06cc\u06ba\u061f",
          optionsEn: ["Seven", "Eight", "Nine", "Ten"],
          optionsUr: ["\u0633\u0627\u062a", "\u0622\u0679\u06be", "\u0646\u0648", "\u062f\u0633"],
          correctIndex: 1,
        },
        {
          promptEn: "Which of these is a living thing?",
          promptUr: "\u0627\u0646 \u0645\u06cc\u06ba \u0633\u06d2 \u06a9\u0648\u0646 \u0633\u06cc \u062c\u0627\u0646\u062f\u0627\u0631 \u0686\u06cc\u0632 \u06c1\u06d2\u061f",
          optionsEn: ["Rock", "Water", "Tree", "Air"],
          optionsUr: ["\u067e\u062a\u06be\u0631", "\u067e\u0627\u0646\u06cc", "\u062f\u0631\u062e\u062a", "\u06c1\u0648\u0627"],
          correctIndex: 2,
        },
      ],
    },
  },
  {
    titleEn: "English 5",
    titleUr: "\u0627\u0646\u06af\u0631\u06cc\u0632\u06cc \u06f5",
    subjectEn: "English",
    subjectUr: "\u0627\u0646\u06af\u0631\u06cc\u0632\u06cc",
    grade: 5,
    board: "PTB",
    author: "Punjab Textbook Board",
    descriptionEn:
      "Grammar fundamentals including parts of speech for Grade 5 learners.",
    descriptionUr:
      "\u062c\u0645\u0627\u0639\u062a \u067e\u0646\u062c\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u06af\u0631\u0627\u0645\u0631 \u06a9\u06d2 \u0628\u0646\u06cc\u0627\u062f\u06cc \u0627\u0635\u0648\u0644\u06d4",
    coverColor: "#2563eb",
    chapters: [
      {
        titleEn: "Nouns",
        titleUr: "\u0627\u0633\u0645",
        contentEn:
          "A noun is a word used to name a person, place, animal, or thing. Words like Ali, Lahore, cat, and book are all nouns, and we use them in almost every sentence we speak or write.\n\nNouns can be divided into different kinds. Common nouns name general things such as city, boy, or river, while proper nouns name particular things such as Karachi, Ahmed, or the Indus, and they always begin with a capital letter.\n\nNouns also change to show number. A singular noun names one thing, such as book, while a plural noun names more than one, such as books. Learning to spot nouns helps us build clear and correct sentences.",
        contentUr:
          "اسم وہ لفظ ہے جو کسی شخص، جگہ، جانور یا چیز کا نام بتائے۔ علی، لاہور، بلی اور کتاب سب اسم ہیں اور ہم انہیں اپنے تقریباً ہر جملے میں استعمال کرتے ہیں۔\n\nاسم کی مختلف اقسام ہیں۔ اسمِ عام عام چیزوں کا نام بتاتا ہے جیسے شہر، لڑکا یا دریا، جبکہ اسمِ خاص کسی مخصوص چیز کا نام بتاتا ہے جیسے کراچی، احمد یا دریائے سندھ۔\n\nاسم تعداد ظاہر کرنے کے لیے بھی بدلتا ہے۔ واحد اسم ایک چیز کا نام ہوتا ہے جیسے کتاب، جبکہ جمع اسم ایک سے زیادہ کا نام ہوتا ہے جیسے کتابیں۔ اسم پہچاننا سیکھنے سے ہم صاف اور درست جملے بنا سکتے ہیں۔",
      },
      {
        titleEn: "Verbs",
        titleUr: "\u0641\u0639\u0644",
        contentEn:
          "A verb is a word that shows an action or a state of being. Words like run, eat, write, and play tell us what someone or something is doing, and they are the engine of every sentence.\n\nEvery complete sentence must have a verb. The verb usually tells us what the subject of the sentence is doing, for example, 'The boy reads a book.' Some verbs, such as is, am, and are, do not show action but show a state of being.\n\nVerbs also change their form to show time, which we call tense. We say 'play' for the present, 'played' for the past, and 'will play' for the future. Using the correct tense makes our meaning clear to the reader.",
        contentUr:
          "فعل وہ لفظ ہے جو کسی کام یا حالت کو ظاہر کرے۔ دوڑنا، کھانا، لکھنا اور کھیلنا جیسے الفاظ بتاتے ہیں کہ کوئی شخص یا چیز کیا کر رہی ہے، اور یہ ہر جملے کی جان ہوتے ہیں۔\n\nہر مکمل جملے میں فعل ضروری ہے۔ فعل عموماً بتاتا ہے کہ جملے کا فاعل کیا کر رہا ہے، مثلاً ’لڑکا کتاب پڑھتا ہے۔‘ کچھ افعال جیسے ہے، ہوں اور ہیں کسی کام کو نہیں بلکہ حالت کو ظاہر کرتے ہیں۔\n\nفعل وقت ظاہر کرنے کے لیے اپنی شکل بھی بدلتا ہے جسے زمانہ کہتے ہیں۔ ہم حال کے لیے ’کھیلتا ہے‘، ماضی کے لیے ’کھیلا‘ اور مستقبل کے لیے ’کھیلے گا‘ کہتے ہیں۔ درست زمانہ استعمال کرنے سے ہمارا مطلب واضح ہو جاتا ہے۔",
      },
    ],
    quiz: {
      titleEn: "Grammar Quiz",
      titleUr: "\u06af\u0631\u0627\u0645\u0631 \u06a9\u0648\u0626\u0632",
      questions: [
        {
          promptEn: "Which word is a noun?",
          promptUr: "\u06a9\u0648\u0646 \u0633\u0627 \u0644\u0641\u0638 \u0627\u0633\u0645 \u06c1\u06d2\u061f",
          optionsEn: ["Run", "Beautiful", "Lahore", "Quickly"],
          optionsUr: ["\u062f\u0648\u0691\u0646\u0627", "\u062e\u0648\u0628\u0635\u0648\u0631\u062a", "\u0644\u0627\u06c1\u0648\u0631", "\u062c\u0644\u062f\u06cc"],
          correctIndex: 2,
        },
        {
          promptEn: "Which word is a verb?",
          promptUr: "\u06a9\u0648\u0646 \u0633\u0627 \u0644\u0641\u0638 \u0641\u0639\u0644 \u06c1\u06d2\u061f",
          optionsEn: ["Book", "Write", "Happy", "Table"],
          optionsUr: ["\u06a9\u062a\u0627\u0628", "\u0644\u06a9\u06be\u0646\u0627", "\u062e\u0648\u0634", "\u0645\u06cc\u0632"],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    titleEn: "Mathematics 5",
    titleUr: "\u0631\u06cc\u0627\u0636\u06cc \u06f5",
    subjectEn: "Mathematics",
    subjectUr: "\u0631\u06cc\u0627\u0636\u06cc",
    grade: 5,
    board: "FBISE",
    author: "Federal Board",
    descriptionEn: "Fractions and basic geometry for Grade 5.",
    descriptionUr: "\u062c\u0645\u0627\u0639\u062a \u067e\u0646\u062c\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u06a9\u0633\u0631\u06cc\u06ba \u0627\u0648\u0631 \u0628\u0646\u06cc\u0627\u062f\u06cc \u062c\u06cc\u0648\u0645\u06cc\u0679\u0631\u06cc\u06d4",
    coverColor: "#ea580c",
    chapters: [
      {
        titleEn: "Fractions",
        titleUr: "\u06a9\u0633\u0631\u06cc\u06ba",
        contentEn:
          "A fraction represents a part of a whole. It is written with two numbers: the numerator on top, which tells how many parts we have, and the denominator on the bottom, which tells how many equal parts the whole is divided into.\n\nFor example, in the fraction one half, written 1/2, the 1 is the numerator and the 2 is the denominator. If a pizza is cut into four equal slices and you take one slice, you have taken one quarter, or 1/4, of the pizza.\n\nFractions that have the same denominator can be added or subtracted by working only with the numerators. Understanding fractions helps us measure, cook, and share things fairly in everyday life.",
        contentUr:
          "کسر کسی پورے کے ایک حصے کو ظاہر کرتی ہے۔ اسے دو اعداد سے لکھا جاتا ہے؛ اوپر شمار کنندہ جو بتاتا ہے کہ ہمارے پاس کتنے حصے ہیں، اور نیچے نسب نما جو بتاتا ہے کہ پورے کو کتنے برابر حصوں میں تقسیم کیا گیا ہے۔\n\nمثال کے طور پر کسر ایک بٹا دو یعنی 1/2 میں 1 شمار کنندہ اور 2 نسب نما ہے۔ اگر ایک پیزا کو چار برابر حصوں میں کاٹا جائے اور آپ ایک حصہ لیں تو آپ نے پیزا کا چوتھائی یعنی 1/4 لیا۔\n\nوہ کسریں جن کا نسب نما ایک جیسا ہو، صرف شمار کنندہ کو جمع یا تفریق کر کے حل کی جا سکتی ہیں۔ کسروں کو سمجھنا روزمرہ زندگی میں ناپنے، پکانے اور چیزوں کو انصاف سے بانٹنے میں مدد دیتا ہے۔",
      },
      {
        titleEn: "Angles and Shapes",
        titleUr: "\u0632\u0627\u0648\u06cc\u06d2 \u0627\u0648\u0631 \u0634\u06a9\u0644\u06cc\u06ba",
        contentEn:
          "An angle is formed when two lines or rays meet at a point. The size of an angle is measured in degrees using a tool called a protractor.\n\nThere are several common kinds of angles. A right angle is exactly 90 degrees, an acute angle is less than 90 degrees, and an obtuse angle is more than 90 degrees but less than 180 degrees.\n\nShapes are made up of sides and angles. A triangle has three sides and three angles, a square has four equal sides and four right angles, and a rectangle has four right angles with opposite sides equal. Geometry helps us understand and build the shapes we see all around us.",
        contentUr:
          "زاویہ اس وقت بنتا ہے جب دو لکیریں یا شعاعیں کسی نقطے پر ملتی ہیں۔ زاویے کی پیمائش درجوں میں ایک آلے کی مدد سے کی جاتی ہے جسے زاویہ پیما کہتے ہیں۔\n\nزاویوں کی کئی عام اقسام ہیں۔ قائمہ زاویہ بالکل 90 درجے کا ہوتا ہے، حادہ زاویہ 90 درجے سے کم اور منفرجہ زاویہ 90 درجے سے زیادہ مگر 180 درجے سے کم ہوتا ہے۔\n\nشکلیں اضلاع اور زاویوں سے بنتی ہیں۔ مثلث کے تین اضلاع اور تین زاویے ہوتے ہیں، مربع کے چار برابر اضلاع اور چار قائمہ زاویے ہوتے ہیں، جبکہ مستطیل کے چار قائمہ زاویے ہوتے ہیں اور مدِ مقابل اضلاع برابر ہوتے ہیں۔ جیومیٹری ہمیں اپنے ارد گرد کی شکلوں کو سمجھنے اور بنانے میں مدد دیتی ہے۔",
      },
    ],
    quiz: {
      titleEn: "Maths Quiz",
      titleUr: "\u0631\u06cc\u0627\u0636\u06cc \u06a9\u0648\u0626\u0632",
      questions: [
        {
          promptEn: "How many degrees are in a right angle?",
          promptUr: "\u0642\u0627\u0626\u0645\u06c1 \u0632\u0627\u0648\u06cc\u06d2 \u0645\u06cc\u06ba \u06a9\u062a\u0646\u06d2 \u062f\u0631\u062c\u06d2 \u06c1\u0648\u062a\u06d2 \u06c1\u06cc\u06ba\u061f",
          optionsEn: ["45", "90", "180", "360"],
          optionsUr: ["\u06f4\u06f5", "\u06f9\u06f0", "\u06f1\u06f8\u06f0", "\u06f3\u06f6\u06f0"],
          correctIndex: 1,
        },
        {
          promptEn: "In the fraction 3/4, which number is the denominator?",
          promptUr: "\u06a9\u0633\u0631 \u06f3/\u06f4 \u0645\u06cc\u06ba \u0646\u0633\u0628 \u0646\u0645\u0627 \u06a9\u0648\u0646 \u0633\u0627 \u0639\u062f\u062f \u06c1\u06d2\u061f",
          optionsEn: ["3", "4", "7", "1"],
          optionsUr: ["\u06f3", "\u06f4", "\u06f7", "\u06f1"],
          correctIndex: 1,
        },
      ],
    },
  },
  {
    titleEn: "Computer Science 8",
    titleUr: "\u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u0633\u0627\u0626\u0646\u0633 \u06f8",
    subjectEn: "Computer Science",
    subjectUr: "\u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u0633\u0627\u0626\u0646\u0633",
    grade: 8,
    board: "FBISE",
    author: "Federal Board",
    descriptionEn: "An introduction to computers and programming for Grade 8.",
    descriptionUr: "\u062c\u0645\u0627\u0639\u062a \u06c1\u0634\u062a\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u0627\u0648\u0631 \u067e\u0631\u0648\u06af\u0631\u0627\u0645\u0646\u06af \u06a9\u0627 \u062a\u0639\u0627\u0631\u0641\u06d4",
    coverColor: "#7c3aed",
    chapters: [
      {
        titleEn: "What is a Computer?",
        titleUr: "\u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u06a9\u06cc\u0627 \u06c1\u06d2\u061f",
        contentEn:
          "A computer is an electronic machine that takes in data, processes it, and gives out useful information. It follows a simple cycle known as input, process, and output.\n\nThe user gives instructions and data through input devices such as a keyboard and mouse. The central processing unit, or CPU, is the brain of the computer and does the actual processing, while memory stores data and instructions so they can be used quickly.\n\nThe results are shown through output devices such as a monitor or printer. Computers are used in schools, hospitals, banks, offices, and homes because they make work faster, more accurate, and easier to repeat.",
        contentUr:
          "کمپیوٹر ایک الیکٹرانک مشین ہے جو ڈیٹا لیتی ہے، اس پر عمل کرتی ہے اور مفید معلومات فراہم کرتی ہے۔ یہ ایک سادے چکر پر چلتا ہے جسے ان پٹ، عمل اور آؤٹ پٹ کہتے ہیں۔\n\nصارف ان پٹ آلات جیسے کی بورڈ اور ماؤس کے ذریعے ہدایات اور ڈیٹا دیتا ہے۔ مرکزی پروسیسنگ یونٹ یعنی سی پی یو کمپیوٹر کا دماغ ہے اور اصل عمل کرتا ہے، جبکہ میموری ڈیٹا اور ہدایات کو محفوظ رکھتی ہے تاکہ انہیں جلدی استعمال کیا جا سکے۔\n\nنتائج آؤٹ پٹ آلات جیسے مانیٹر یا پرنٹر کے ذریعے دکھائے جاتے ہیں۔ کمپیوٹر اسکولوں، اسپتالوں، بینکوں، دفاتر اور گھروں میں استعمال ہوتے ہیں کیونکہ یہ کام کو تیز، زیادہ درست اور آسان بنا دیتے ہیں۔",
      },
      {
        titleEn: "Introduction to Programming",
        titleUr: "\u067e\u0631\u0648\u06af\u0631\u0627\u0645\u0646\u06af \u06a9\u0627 \u062a\u0639\u0627\u0631\u0641",
        contentEn:
          "Programming is the process of giving a computer a set of instructions to perform a task. These instructions are written in a programming language, such as Python, that the computer can understand.\n\nA program normally runs step by step, from top to bottom. To make programs powerful, programmers use loops to repeat actions many times and conditions, like if statements, to make decisions based on the data.\n\nWriting programs improves logical thinking and problem solving because you must break a big task into small, clear steps. Even simple programs, such as adding two numbers or printing a message, teach the basic ideas used in larger software.",
        contentUr:
          "پروگرامنگ کمپیوٹر کو ہدایات کا ایک مجموعہ دینے کا عمل ہے تاکہ وہ کوئی کام انجام دے۔ یہ ہدایات کسی پروگرامنگ زبان میں لکھی جاتی ہیں، جیسے پائیتھن، جسے کمپیوٹر سمجھ سکتا ہے۔\n\nپروگرام عام طور پر اوپر سے نیچے قدم بہ قدم چلتا ہے۔ پروگرام کو طاقتور بنانے کے لیے پروگرامر لوپ استعمال کرتے ہیں تاکہ کسی کام کو بار بار دہرایا جا سکے اور شرائط جیسے اگر کے جملے استعمال کرتے ہیں تاکہ ڈیٹا کی بنیاد پر فیصلے کیے جا سکیں۔\n\nپروگرام لکھنے سے منطقی سوچ اور مسئلہ حل کرنے کی صلاحیت بہتر ہوتی ہے کیونکہ آپ کو ایک بڑے کام کو چھوٹے اور واضح مراحل میں تقسیم کرنا پڑتا ہے۔ سادے پروگرام بھی، جیسے دو اعداد جمع کرنا یا کوئی پیغام دکھانا، بڑے سافٹ ویئر میں استعمال ہونے والے بنیادی تصورات سکھاتے ہیں۔",
      },
    ],
    quiz: {
      titleEn: "Computer Quiz",
      titleUr: "\u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u06a9\u0648\u0626\u0632",
      questions: [
        {
          promptEn: "Which part of the computer processes data?",
          promptUr: "\u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u06a9\u0627 \u06a9\u0648\u0646 \u0633\u0627 \u062d\u0635\u06c1 \u0688\u06cc\u0679\u0627 \u067e\u0631 \u0639\u0645\u0644 \u06a9\u0631\u062a\u0627 \u06c1\u06d2\u061f",
          optionsEn: ["Monitor", "CPU", "Keyboard", "Printer"],
          optionsUr: ["\u0645\u0627\u0646\u06cc\u0679\u0631", "\u0633\u06cc \u067e\u06cc \u06cc\u0648", "\u06a9\u06cc \u0628\u0648\u0631\u0688", "\u067e\u0631\u0646\u0679\u0631"],
          correctIndex: 1,
        },
        {
          promptEn: "Which is a programming language?",
          promptUr: "\u06a9\u0648\u0646 \u0633\u06cc \u0627\u06cc\u06a9 \u067e\u0631\u0648\u06af\u0631\u0627\u0645\u0646\u06af \u0632\u0628\u0627\u0646 \u06c1\u06d2\u061f",
          optionsEn: ["Python", "Urdu", "English", "Arabic"],
          optionsUr: ["\u067e\u0627\u0626\u06cc\u062a\u06be\u0646", "\u0627\u0631\u062f\u0648", "\u0627\u0646\u06af\u0631\u06cc\u0632\u06cc", "\u0639\u0631\u0628\u06cc"],
          correctIndex: 0,
        },
      ],
    },
  },
  {
    titleEn: "General Mathematics 10 (KPK)",
    titleUr: "\u062c\u0646\u0631\u0644 \u0631\u06cc\u0627\u0636\u06cc \u06f1\u06f0 (\u06a9\u06d2 \u067e\u06cc \u06a9\u06d2)",
    subjectEn: "Mathematics",
    subjectUr: "\u0631\u06cc\u0627\u0636\u06cc",
    grade: 10,
    board: "BISEP",
    author: "Khyber Pakhtunkhwa Textbook Board",
    descriptionEn:
      "The complete English-medium General Mathematics textbook for Grade 10, published for Khyber Pakhtunkhwa (BISEP). Read the full official PDF inside the app.",
    descriptionUr:
      "\u062c\u0645\u0627\u0639\u062a \u062f\u06c1\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u0645\u06a9\u0645\u0644 \u0627\u0646\u06af\u0644\u0634 \u0645\u06cc\u0688\u06cc\u0645 \u062c\u0646\u0631\u0644 \u0631\u06cc\u0627\u0636\u06cc \u06a9\u06cc \u0646\u0635\u0627\u0628\u06cc \u06a9\u062a\u0627\u0628\u060c \u062e\u06cc\u0628\u0631 \u067e\u062e\u062a\u0648\u0646\u062e\u0648\u0627 (\u0628\u06cc \u0622\u0626\u06cc \u0627\u06cc\u0633 \u0627\u06cc \u067e\u06cc) \u06a9\u06d2 \u0644\u06cc\u06d2 \u0634\u0627\u0626\u0639 \u0634\u062f\u06c1\u06d4 \u0645\u06a9\u0645\u0644 \u0633\u0631\u06a9\u0627\u0631\u06cc \u067e\u06cc \u0688\u06cc \u0627\u06cc\u0641 \u0627\u06cc\u067e \u06a9\u06d2 \u0627\u0646\u062f\u0631 \u067e\u0691\u06be\u06cc\u06ba\u06d4",
    coverColor: "#0d9488",
    pdfFile: "kpk-general-math-10.pdf",
    chapters: [],
  },
  {
    titleEn: "Pakistan Studies 10 (KPK)",
    titleUr: "\u0645\u0637\u0627\u0644\u0639\u06c1 \u067e\u0627\u06a9\u0633\u062a\u0627\u0646 \u06f1\u06f0 (\u06a9\u06d2 \u067e\u06cc \u06a9\u06d2)",
    subjectEn: "Pakistan Studies",
    subjectUr: "\u0645\u0637\u0627\u0644\u0639\u06c1 \u067e\u0627\u06a9\u0633\u062a\u0627\u0646",
    grade: 10,
    board: "BISEP",
    author: "Khyber Pakhtunkhwa Textbook Board",
    descriptionEn:
      "The complete English-medium Pakistan Studies textbook for Grade 10, published for Khyber Pakhtunkhwa (BISEP). Read the full official PDF inside the app.",
    descriptionUr:
      "\u062c\u0645\u0627\u0639\u062a \u062f\u06c1\u0645 \u06a9\u06d2 \u0644\u06cc\u06d2 \u0645\u06a9\u0645\u0644 \u0627\u0646\u06af\u0644\u0634 \u0645\u06cc\u0688\u06cc\u0645 \u0645\u0637\u0627\u0644\u0639\u06c1 \u067e\u0627\u06a9\u0633\u062a\u0627\u0646 \u06a9\u06cc \u0646\u0635\u0627\u0628\u06cc \u06a9\u062a\u0627\u0628\u060c \u062e\u06cc\u0628\u0631 \u067e\u062e\u062a\u0648\u0646\u062e\u0648\u0627 (\u0628\u06cc \u0622\u0626\u06cc \u0627\u06cc\u0633 \u0627\u06cc \u067e\u06cc) \u06a9\u06d2 \u0644\u06cc\u06d2 \u0634\u0627\u0626\u0639 \u0634\u062f\u06c1\u06d4 \u0645\u06a9\u0645\u0644 \u0633\u0631\u06a9\u0627\u0631\u06cc \u067e\u06cc \u0688\u06cc \u0627\u06cc\u0641 \u0627\u06cc\u067e \u06a9\u06d2 \u0627\u0646\u062f\u0631 \u067e\u0691\u06be\u06cc\u06ba\u06d4",
    coverColor: "#b45309",
    pdfFile: "kpk-pak-studies-10.pdf",
    chapters: [],
  },
];

const demoUsers = [
  {
    email: "admin@ekitab.pk",
    name: "System Admin",
    password: "Password123",
    role: "admin" as const,
    grade: null,
  },
  {
    email: "teacher@ekitab.pk",
    name: "Sir Imran",
    password: "Password123",
    role: "teacher" as const,
    grade: null,
  },
  {
    email: "student@ekitab.pk",
    name: "Ayesha Khan",
    password: "Password123",
    role: "student" as const,
    grade: 5,
  },
  {
    email: "bilal@ekitab.pk",
    name: "Bilal Ahmed",
    password: "Password123",
    role: "student" as const,
    grade: 8,
  },
  {
    email: "parent@ekitab.pk",
    name: "Bushra Khan",
    password: "Password123",
    role: "parent" as const,
    grade: null,
  },
];

export function seed(): void {
  migrate();

  const existing = db.prepare("SELECT COUNT(*) AS count FROM books").get() as {
    count: number;
  };
  if (existing.count > 0) {
    console.log("Database already seeded; skipping.");
    return;
  }

  const insertUser = db.prepare(
    `INSERT INTO users (email, name, password_hash, role, grade, preferred_language)
     VALUES (?, ?, ?, ?, ?, 'en')`,
  );
  const userIdByEmail = new Map<string, number>();
  for (const user of demoUsers) {
    const hash = bcrypt.hashSync(user.password, 10);
    const result = insertUser.run(
      user.email,
      user.name,
      hash,
      user.role,
      user.grade,
    );
    userIdByEmail.set(user.email, Number(result.lastInsertRowid));
  }

  const insertBook = db.prepare(
    `INSERT INTO books
      (title_en, title_ur, subject_en, subject_ur, grade, board, author, description_en, description_ur, cover_color, pdf_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertChapter = db.prepare(
    `INSERT INTO chapters (book_id, position, title_en, title_ur, content_en, content_ur)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertQuiz = db.prepare(
    "INSERT INTO quizzes (book_id, title_en, title_ur) VALUES (?, ?, ?)",
  );
  const insertQuestion = db.prepare(
    `INSERT INTO questions (quiz_id, position, prompt_en, prompt_ur, options_en, options_ur, correct_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  const seededBooks: { bookId: number; quizId: number; questionCount: number }[] =
    [];

  const seedAll = db.transaction(() => {
    for (const book of books) {
      const bookResult = insertBook.run(
        book.titleEn,
        book.titleUr,
        book.subjectEn,
        book.subjectUr,
        book.grade,
        book.board,
        book.author,
        book.descriptionEn,
        book.descriptionUr,
        book.coverColor,
        book.pdfFile ?? null,
      );
      const bookId = Number(bookResult.lastInsertRowid);
      book.chapters.forEach((chapter, index) => {
        insertChapter.run(
          bookId,
          index,
          chapter.titleEn,
          chapter.titleUr,
          chapter.contentEn,
          chapter.contentUr,
        );
      });
      if (!book.quiz) {
        seededBooks.push({ bookId, quizId: 0, questionCount: 0 });
        continue;
      }
      const quizResult = insertQuiz.run(
        bookId,
        book.quiz.titleEn,
        book.quiz.titleUr,
      );
      const quizId = Number(quizResult.lastInsertRowid);
      book.quiz.questions.forEach((question, index) => {
        insertQuestion.run(
          quizId,
          index,
          question.promptEn,
          question.promptUr,
          JSON.stringify(question.optionsEn),
          JSON.stringify(question.optionsUr),
          question.correctIndex,
        );
      });
      seededBooks.push({
        bookId,
        quizId,
        questionCount: book.quiz.questions.length,
      });
    }
  });
  seedAll();

  seedRelations(userIdByEmail, seededBooks);

  console.log(
    `Seeded ${books.length} books and ${demoUsers.length} demo users.`,
  );
}

function seedRelations(
  userIdByEmail: Map<string, number>,
  seededBooks: { bookId: number; quizId: number; questionCount: number }[],
): void {
  const ayesha = userIdByEmail.get("student@ekitab.pk");
  const bilal = userIdByEmail.get("bilal@ekitab.pk");
  const parent = userIdByEmail.get("parent@ekitab.pk");
  const teacher = userIdByEmail.get("teacher@ekitab.pk");
  if (!ayesha || !bilal || !parent || !teacher || seededBooks.length === 0) {
    return;
  }

  const insertLink = db.prepare(
    "INSERT OR IGNORE INTO parent_children (parent_id, child_id) VALUES (?, ?)",
  );
  const insertProgress = db.prepare(
    `INSERT OR REPLACE INTO progress (user_id, book_id, last_chapter_id, percent, updated_at)
     VALUES (?, ?, NULL, ?, datetime('now', ?))`,
  );
  const insertAttempt = db.prepare(
    `INSERT INTO quiz_attempts (user_id, quiz_id, score, total, created_at)
     VALUES (?, ?, ?, ?, datetime('now', ?))`,
  );
  const insertAssignment = db.prepare(
    `INSERT INTO assignments (teacher_id, student_id, book_id, quiz_id, note, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const run = db.transaction(() => {
    insertLink.run(parent, ayesha);
    insertLink.run(parent, bilal);

    // Ayesha: a few books in progress + quiz attempts
    const aProgress = [85, 40, 100];
    aProgress.forEach((percent, i) => {
      const book = seededBooks[i % seededBooks.length];
      insertProgress.run(ayesha, book.bookId, percent, `-${i + 1} days`);
    });
    const aScores = [
      { idx: 0, score: 3 },
      { idx: 1, score: 2 },
      { idx: 2, score: 3 },
    ];
    aScores.forEach((s, i) => {
      const book = seededBooks[s.idx % seededBooks.length];
      insertAttempt.run(
        ayesha,
        book.quizId,
        Math.min(s.score, book.questionCount),
        book.questionCount,
        `-${i + 1} days`,
      );
    });

    // Bilal: lighter activity
    insertProgress.run(bilal, seededBooks[0].bookId, 55, "-2 days");
    insertProgress.run(
      bilal,
      seededBooks[Math.min(1, seededBooks.length - 1)].bookId,
      20,
      "-1 days",
    );
    insertAttempt.run(
      bilal,
      seededBooks[0].quizId,
      Math.min(1, seededBooks[0].questionCount),
      seededBooks[0].questionCount,
      "-1 days",
    );

    // Teacher assignments
    const dueSoon = new Date(Date.now() + 5 * 86400000)
      .toISOString()
      .slice(0, 10);
    insertAssignment.run(
      teacher,
      ayesha,
      seededBooks[Math.min(1, seededBooks.length - 1)].bookId,
      null,
      "Please read chapter 2 before Friday.",
      dueSoon,
    );
    insertAssignment.run(
      teacher,
      ayesha,
      null,
      seededBooks[0].quizId,
      "Complete this quiz for practice.",
      dueSoon,
    );
    insertAssignment.run(
      teacher,
      bilal,
      seededBooks[0].bookId,
      null,
      "Catch up on the first chapter.",
      dueSoon,
    );
  });
  run();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
