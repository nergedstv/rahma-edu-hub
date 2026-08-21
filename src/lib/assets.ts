import logo from "@/assets/rahma-logo.jpg.asset.json";
import student from "@/assets/student.jpg.asset.json";
import studentsInClass from "@/assets/studentsinclass.jpg.asset.json";
import classOfStudents from "@/assets/classofstudent.jpg.asset.json";
import studentE from "@/assets/studente.jpg.asset.json";
import g01 from "@/assets/gallery-01.jpg.asset.json";
import g02 from "@/assets/gallery-02.jpg.asset.json";
import g03 from "@/assets/gallery-03.jpg.asset.json";
import g04 from "@/assets/gallery-04.jpg.asset.json";
import g05 from "@/assets/gallery-05.jpg.asset.json";
import g06 from "@/assets/gallery-06.jpg.asset.json";
import g07 from "@/assets/gallery-07.jpg.asset.json";
import g08 from "@/assets/gallery-08.jpg.asset.json";
import g09 from "@/assets/gallery-09.jpg.asset.json";
import g10 from "@/assets/gallery-10.jpg.asset.json";

export const logoUrl = logo.url;

/** Photos used by the sign-in / portal side slideshow. */
export const portalPhotos = [student.url, studentsInClass.url, classOfStudents.url, studentE.url];

export const galleryPhotos = [
  { url: g01.url, caption: "A proud moment at Rahma" },
  { url: g02.url, caption: "Focused classroom learning" },
  { url: g03.url, caption: "Graduation and milestones" },
  { url: g04.url, caption: "Building computer skills" },
  { url: g05.url, caption: "Confidence beyond the classroom" },
  { url: g06.url, caption: "Growing together as a community" },
  { url: g07.url, caption: "Support that makes a difference" },
  { url: g08.url, caption: "Community and staff experiences" },
  { url: g09.url, caption: "Teamwork, energy and confidence" },
  { url: g10.url, caption: "The Rahma experience" },
];

export const heroPhotos = [g01.url, g02.url, g04.url, g05.url, g09.url];
