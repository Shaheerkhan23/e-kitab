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
  chapters: SeedChapter[];
  quiz: { titleEn: string; titleUr: string; questions: SeedQuestion[] };
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
          "Everything around us is either living or non-living. Living things can grow, breathe, move, reproduce, and respond to their environment. Plants, animals, and humans are living things. Non-living things such as rocks, water, and air do not grow or reproduce. Living things need food, water, and air to survive. Scientists study living things to understand how life works.",
        contentUr:
          "\u06c1\u0645\u0627\u0631\u06d2 \u0627\u0631\u062f \u06af\u0631\u062f \u06c1\u0631 \u0686\u06cc\u0632 \u06cc\u0627 \u062a\u0648 \u062c\u0627\u0646\u062f\u0627\u0631 \u06c1\u06d2 \u06cc\u0627 \u0628\u06d2 \u062c\u0627\u0646\u06d4 \u062c\u0627\u0646\u062f\u0627\u0631 \u0627\u0634\u06cc\u0627\u0621 \u0628\u0691\u06be \u0633\u06a9\u062a\u06cc \u06c1\u06cc\u06ba\u060c \u0633\u0627\u0646\u0633 \u0644\u06cc\u062a\u06cc \u06c1\u06cc\u06ba \u0627\u0648\u0631 \u062d\u0631\u06a9\u062a \u06a9\u0631\u062a\u06cc \u06c1\u06cc\u06ba\u06d4 \u067e\u0648\u062f\u06d2\u060c \u062c\u0627\u0646\u0648\u0631 \u0627\u0648\u0631 \u0627\u0646\u0633\u0627\u0646 \u062c\u0627\u0646\u062f\u0627\u0631 \u06c1\u06cc\u06ba\u06d4",
      },
      {
        titleEn: "Photosynthesis",
        titleUr: "\u0636\u06cc\u0627\u0626\u06cc \u062a\u0631\u06a9\u06cc\u0628",
        contentEn:
          "Photosynthesis is the process by which green plants make their own food. Plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. The green pigment called chlorophyll captures sunlight. This process takes place mainly in the leaves. Photosynthesis is very important because it provides food and releases oxygen that animals and humans need to breathe.",
        contentUr:
          "\u0636\u06cc\u0627\u0626\u06cc \u062a\u0631\u06a9\u06cc\u0628 \u0648\u06c1 \u0639\u0645\u0644 \u06c1\u06d2 \u062c\u0633 \u06a9\u06d2 \u0630\u0631\u06cc\u0639\u06d2 \u0633\u0628\u0632 \u067e\u0648\u062f\u06d2 \u0627\u067e\u0646\u06cc \u062e\u0648\u0631\u0627\u06a9 \u062e\u0648\u062f \u0628\u0646\u0627\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4 \u067e\u0648\u062f\u06d2 \u0633\u0648\u0631\u062c \u06a9\u06cc \u0631\u0648\u0634\u0646\u06cc\u060c \u067e\u0627\u0646\u06cc \u0627\u0648\u0631 \u06a9\u0627\u0631\u0628\u0646 \u0688\u0627\u0626\u06cc \u0622\u06a9\u0633\u0627\u0626\u06cc\u0688 \u0633\u06d2 \u06af\u0644\u0648\u06a9\u0648\u0632 \u0627\u0648\u0631 \u0622\u06a9\u0633\u06cc\u062c\u0646 \u0628\u0646\u0627\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4",
      },
      {
        titleEn: "The Solar System",
        titleUr: "\u0646\u0638\u0627\u0645 \u0634\u0645\u0633\u06cc",
        contentEn:
          "The solar system is made up of the Sun and the eight planets that move around it. The planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. The Sun is a star and is the largest object in the solar system. Earth is the only planet known to support life. The planets move around the Sun in fixed paths called orbits.",
        contentUr:
          "\u0646\u0638\u0627\u0645 \u0634\u0645\u0633\u06cc \u0633\u0648\u0631\u062c \u0627\u0648\u0631 \u0627\u0633 \u06a9\u06d2 \u06af\u0631\u062f \u06af\u06be\u0648\u0645\u0646\u06d2 \u0648\u0627\u0644\u06d2 \u0622\u0679\u06be \u0633\u06cc\u0627\u0631\u0648\u06ba \u067e\u0631 \u0645\u0634\u062a\u0645\u0644 \u06c1\u06d2\u06d4 \u0632\u0645\u06cc\u0646 \u0648\u0627\u062d\u062f \u0633\u06cc\u0627\u0631\u06c1 \u06c1\u06d2 \u062c\u0633 \u067e\u0631 \u0632\u0646\u062f\u06af\u06cc \u0645\u0648\u062c\u0648\u062f \u06c1\u06d2\u06d4 \u0633\u0648\u0631\u062c \u0627\u06cc\u06a9 \u0633\u062a\u0627\u0631\u06c1 \u06c1\u06d2\u06d4",
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
          "A noun is a word used to name a person, place, animal, or thing. For example, Ali, Lahore, cat, and book are all nouns. Common nouns name general things like city or boy. Proper nouns name specific things like Karachi or Ahmed and always begin with a capital letter. Nouns can be singular or plural.",
        contentUr:
          "\u0627\u0633\u0645 \u0648\u06c1 \u0644\u0641\u0638 \u06c1\u06d2 \u062c\u0648 \u06a9\u0633\u06cc \u0634\u062e\u0635\u060c \u062c\u06af\u06c1\u060c \u062c\u0627\u0646\u0648\u0631 \u06cc\u0627 \u0686\u06cc\u0632 \u06a9\u0627 \u0646\u0627\u0645 \u0628\u062a\u0627\u0626\u06d2\u06d4 \u0645\u062b\u0627\u0644 \u06a9\u06d2 \u0637\u0648\u0631 \u067e\u0631 \u0639\u0644\u06cc\u060c \u0644\u0627\u06c1\u0648\u0631 \u0627\u0648\u0631 \u06a9\u062a\u0627\u0628 \u0633\u0628 \u0627\u0633\u0645 \u06c1\u06cc\u06ba\u06d4",
      },
      {
        titleEn: "Verbs",
        titleUr: "\u0641\u0639\u0644",
        contentEn:
          "A verb is a word that shows an action or a state of being. Words like run, eat, write, and play are action verbs. Verbs tell us what the subject of a sentence is doing. Every complete sentence must have a verb. Verbs also change form to show time, such as past, present, and future.",
        contentUr:
          "\u0641\u0639\u0644 \u0648\u06c1 \u0644\u0641\u0638 \u06c1\u06d2 \u062c\u0648 \u06a9\u0633\u06cc \u06a9\u0627\u0645 \u06cc\u0627 \u062d\u0627\u0644\u062a \u06a9\u0648 \u0638\u0627\u06c1\u0631 \u06a9\u0631\u06d2\u06d4 \u062f\u0648\u0691\u0646\u0627\u060c \u06a9\u06be\u0627\u0646\u0627 \u0627\u0648\u0631 \u0644\u06a9\u06be\u0646\u0627 \u0641\u0639\u0644 \u06c1\u06cc\u06ba\u06d4 \u06c1\u0631 \u0645\u06a9\u0645\u0644 \u062c\u0645\u0644\u06d2 \u0645\u06cc\u06ba \u0641\u0639\u0644 \u0636\u0631\u0648\u0631\u06cc \u06c1\u06d2\u06d4",
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
          "A fraction represents a part of a whole. It has two numbers: the numerator on top and the denominator on the bottom. For example, in the fraction one half, 1 is the numerator and 2 is the denominator. Fractions with the same denominator can be added by adding the numerators. Understanding fractions helps us share things equally.",
        contentUr:
          "\u06a9\u0633\u0631 \u06a9\u0633\u06cc \u067e\u0648\u0631\u06d2 \u06a9\u06d2 \u0627\u06cc\u06a9 \u062d\u0635\u06d2 \u06a9\u0648 \u0638\u0627\u06c1\u0631 \u06a9\u0631\u062a\u06cc \u06c1\u06d2\u06d4 \u0627\u0633 \u0645\u06cc\u06ba \u062f\u0648 \u0627\u0639\u062f\u0627\u062f \u06c1\u0648\u062a\u06d2 \u06c1\u06cc\u06ba\u060c \u0634\u0645\u0627\u0631 \u06a9\u0646\u0646\u062f\u06c1 \u0627\u0648\u067e\u0631 \u0627\u0648\u0631 \u0646\u0633\u0628 \u0646\u0645\u0627 \u0646\u06cc\u0686\u06d2\u06d4",
      },
      {
        titleEn: "Angles and Shapes",
        titleUr: "\u0632\u0627\u0648\u06cc\u06d2 \u0627\u0648\u0631 \u0634\u06a9\u0644\u06cc\u06ba",
        contentEn:
          "An angle is formed when two lines meet at a point. Angles are measured in degrees. A right angle is exactly 90 degrees. A triangle has three sides and three angles, while a square has four equal sides and four right angles. Geometry helps us understand shapes around us.",
        contentUr:
          "\u0632\u0627\u0648\u06cc\u06c1 \u0627\u0633 \u0648\u0642\u062a \u0628\u0646\u062a\u0627 \u06c1\u06d2 \u062c\u0628 \u062f\u0648 \u0644\u06a9\u06cc\u0631\u06cc\u06ba \u0627\u06cc\u06a9 \u0646\u0642\u0637\u06d2 \u067e\u0631 \u0645\u0644\u062a\u06cc \u06c1\u06cc\u06ba\u06d4 \u0642\u0627\u0626\u0645\u06c1 \u0632\u0627\u0648\u06cc\u06c1 \u0679\u06be\u06cc\u06a9 \u06f9\u06f0 \u062f\u0631\u062c\u06d2 \u06a9\u0627 \u06c1\u0648\u062a\u0627 \u06c1\u06d2\u06d4 \u0645\u062b\u0644\u062b \u06a9\u06d2 \u062a\u06cc\u0646 \u0627\u0636\u0644\u0627\u0639 \u06c1\u0648\u062a\u06d2 \u06c1\u06cc\u06ba\u06d4",
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
          "A computer is an electronic machine that processes data and gives useful information. It takes input from the user, processes it using the central processing unit, and produces output. Computers store data in memory. They are used in schools, hospitals, banks, and homes to make work faster and easier.",
        contentUr:
          "\u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u0627\u06cc\u06a9 \u0627\u0644\u06cc\u06a9\u0679\u0631\u0627\u0646\u06a9 \u0645\u0634\u06cc\u0646 \u06c1\u06d2 \u062c\u0648 \u0688\u06cc\u0679\u0627 \u067e\u0631 \u0639\u0645\u0644 \u06a9\u0631 \u06a9\u06d2 \u0645\u0641\u06cc\u062f \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0641\u0631\u0627\u06c1\u0645 \u06a9\u0631\u062a\u06cc \u06c1\u06d2\u06d4 \u06cc\u06c1 \u0635\u0627\u0631\u0641 \u0633\u06d2 \u0627\u0646 \u067e\u0679 \u0644\u06cc\u062a\u0627 \u06c1\u06d2 \u0627\u0648\u0631 \u0622\u0624\u0679 \u067e\u0679 \u062f\u06cc\u062a\u0627 \u06c1\u06d2\u06d4",
      },
      {
        titleEn: "Introduction to Programming",
        titleUr: "\u067e\u0631\u0648\u06af\u0631\u0627\u0645\u0646\u06af \u06a9\u0627 \u062a\u0639\u0627\u0631\u0641",
        contentEn:
          "Programming is the process of giving instructions to a computer to perform a task. These instructions are written in a programming language such as Python. A program runs step by step from top to bottom. Programmers use loops to repeat actions and conditions to make decisions. Learning programming improves logical thinking.",
        contentUr:
          "\u067e\u0631\u0648\u06af\u0631\u0627\u0645\u0646\u06af \u06a9\u0645\u067e\u06cc\u0648\u0679\u0631 \u06a9\u0648 \u06c1\u062f\u0627\u06cc\u0627\u062a \u062f\u06cc\u0646\u06d2 \u06a9\u0627 \u0639\u0645\u0644 \u06c1\u06d2 \u062a\u0627\u06a9\u06c1 \u0648\u06c1 \u06a9\u0648\u0626\u06cc \u06a9\u0627\u0645 \u0627\u0646\u062c\u0627\u0645 \u062f\u06d2\u06d4 \u06cc\u06c1 \u06c1\u062f\u0627\u06cc\u0627\u062a \u067e\u0627\u0626\u06cc\u062a\u06be\u0646 \u062c\u06cc\u0633\u06cc \u0632\u0628\u0627\u0646 \u0645\u06cc\u06ba \u0644\u06a9\u06be\u06cc \u062c\u0627\u062a\u06cc \u06c1\u06cc\u06ba\u06d4",
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
      (title_en, title_ur, subject_en, subject_ur, grade, board, author, description_en, description_ur, cover_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
