const courseData = {
  // 'AAAAAAA9999': {
  //     'prereqText': 'None',
  // },
  "MATH 124": {
    id: "MATH 124",
    prereqText: "None",
  },
  "MATH 125": {
    id: "MATH 125",
    prereqText: "Either minimum grade of 2.0 in MATH 124, score of 3 on AB advanced placement test, or score of 3 on BC advanced placement test.",
  },
  "MATH 126": {
    id: "MATH 126",
    prereqText: "Either a minimum grade of 2.0 in MATH 125, or a score of 4 on BC advanced placement test.",
  },
  "MATH 307": {
    id: "MATH 307",
    prereqText: "Minimum grade of 2.0 in MATH 125.",
  },
  // "AMATH 351": {
  //   prereqText: "MATH 125 or MATH 135.",
  // },
  "MATH 308": {
    id: "MATH 308",
    prereqText: "Minimum grade of 2.0 in MATH 126.",
  },
  // "AMATH 352": {
  //   prereqText: "MATH 126 or MATH 136.",
  // },
  "MATH 309": {
    id: "MATH 309",
    prereqText: "Either a minimum grade of 2.0 in both MATH 307 and MATH 308 or minimum grade of 2.0 in MATH 136.",
  },
  "MATH 324": {
    id: "MATH 324",
    prereqText: "Minimum grade of 2.0 in either MATH 126 or MATH 136.",
  },
  "PHYS 121": {
    id: "PHYS 121",
    prereqText: "Either MATH 124 or MATH 134, which may be taken concurrently.",
  },
  "PHYS 122": {
    id: "PHYS 122",
    prereqText: "Either MATH 125 or MATH 134, which may be taken concurrently; PHYS 121.",
  },
  "PHYS 123": {
    id: "PHYS 123",
    prereqText: "Either MATH 126 or MATH 134, which may be taken concurrently; PHYS 122.",
  },
  // "CHEM 142": {
  // // eslint-disable-next-line max-len
  //   prereqText: "Either a minimum grade of 1.7 in CHEM 110, a passing score in the General Chemistry Placement exam, or a score of 1 or higher on Chemistry AP test.",
  // },
  "CHEM 142": {
    id: "CHEM 142",
    prereqText: "None",
  },
  "CHEM 152": {
    id: "CHEM 152",
    prereqText: "Minimum grade of 1.7 in either CHEM 142, CHEM 143 or CHEM 145.",
  },
  "A A 210": {
    id: "A A 210",
    prereqText: "Minimum grade of 2.0 in either MATH 126 or MATH 136; minimum grade of 2.0 in PHYS 121.",
  },
  "AMATH 301": {
    id: "AMATH 301",
    prereqText: "Either MATH 125, Q SCI 292, or MATH 135.",
  },
  "CEE 220": {
    id: "CEE 220",
    prereqText: "Minimum grade of 2.0 in A A 210.",
  },
  "E E 215": {
    id: "E E 215",
    prereqText: "Either MATH 136, or MATH 126 and either MATH 307 or AMATH 351, either of which may be taken concurrently; PHYS 122.",
  },
  "STAT 390": {
    id: "STAT 390",
    prereqText: "Either MATH 126 or MATH 136.",
  },
  "M E 123": {
    id: "M E 123",
    prereqText: "None",
  },
  "M E 230": {
    id: "M E 230",
    prereqText: "A A 210. Instructors: Fabien",
  },
  "MSE 170": {
    id: "MSE 170",
    prereqText: "Either CHEM 142, CHEM 143, or CHEM 145.",
  },
  "M E 323": {
    id: "M E 323",
    prereqText: "Either CHEM 142 or CHEM 144; MATH 126; PHYS 121. Instructors: Kramlich",
  },
  "M E 331": {
    id: "M E 331",
    prereqText: "Either M E 333 or CEE 342. Instructors: Emery",
  },
  "M E 333": {
    id: "M E 333",
    prereqText: "AMATH 301; M E 323; either MATH 307 or AMATH 351. Instructors: Riley",
  },
  "M E 354": {
    id: "M E 354",
    prereqText: "MSE 170; CEE 220. Instructors: Tuttle",
    // Corrected comma to semicolon
  },
  "M E 355": {
    id: "M E 355",
    prereqText: "M E 354. Instructors: Ramulu",
  },
  "M E 356": {
    id: "M E 356",
    prereqText: "M E 354. Instructors: Chung",
  },
  "M E 373": {
    id: "M E 373",
    prereqText: "Either AMATH 351 or MATH 307; either AMATH 352 or MATH 308; E E 215; M E 230. Instructors: Garbini",
  },
  "M E 374": {
    id: "M E 374",
    prereqText: "AMATH 301; M E 373. Instructors: Garbini",
  },
  "M E 395": {
    id: "M E 395",
    prereqText: "M E 123; M E 323; IND E 315 or STAT 390 either of which may be taken concurrently. Instructors: Cooper",
  },
  "M E 495": {
    id: "M E 495",
    prereqText: "M E 395; M E 494. Instructors: Cooper", // Added M E 494
  },
  "M E 471": {
    id: "M E 471",
    prereqText: "M E 374. Instructors: Berg",
  },
  "M E 473": {
    id: "M E 473",
    prereqText: "M E 374. Instructors: Garbini",
  },
  "M E 477": {
    id: "M E 477",
    prereqText: "M E 374. Instructors: Garbini",
  },
  "M E 494": {
    id: "M E 494",
    prereqText: "M E 471; M E 473. Instructors: Garbini",
  },
  "M E 478": {
    id: "M E 478",
    prereqText: "M E 123; M E 374; either MATH 308 or AMATH 352. Instructors: Reinhall",
  },
  "M E 480": {
    id: "M E 480",
    prereqText: "M E 123; AMATH 301. Instructors: Ganter",
  },
};

export default courseData;
