import type { Batch, Memory, Profile, Program } from '../src/shared';
export const programs: Program[] = [
  { id: 'arts', name: 'Arts & Humanities', short: 'Arts' },
  { id: 'business', name: 'Business Administration', short: 'Business' },
  { id: 'engineering', name: 'Engineering', short: 'Engineering' },
  { id: 'education', name: 'Education', short: 'Education' }
];
export const batches: Batch[] = [
  { year: 2024, theme: 'The next chapter', subtitle: 'A year of new beginnings and lasting friendships.' },
  { year: 2022, theme: 'Together, always', subtitle: 'The stories we made, the people we became.' },
  { year: 2019, theme: 'Made of moments', subtitle: 'A collection of ordinary days worth remembering.' },
  { year: 2016, theme: 'The golden days', subtitle: 'Where all our journeys first crossed.' }
];
export const profiles: Profile[] = [
  { id:'maya-chen',userId:'u-maya',name:'Maya Chen',year:2024,programId:'arts',motto:'Make room for wonder.',bio:'Maya spent her college years documenting the small, beautiful things: late studio nights, campus walks, and the friends who made every deadline easier.',portrait:'/portraits/maya.jpg',visibility:'public',status:'published' },
  { id:'jordan-reyes',userId:'u-jordan',name:'Jordan Reyes',year:2024,programId:'engineering',motto:'Build things that bring people together.',bio:'Jordan still remembers the first project that failed spectacularly—and the friends who stayed to rebuild it.',portrait:'/portraits/jordan.jpg',visibility:'public',status:'published' },
  { id:'amelia-park',userId:'u-amelia',name:'Amelia Park',year:2024,programId:'business',motto:'Begin before you feel ready.',bio:'A familiar face at student events, Amelia found her confidence by making space for others to shine.',portrait:'/portraits/amelia.jpg',visibility:'public',status:'published' },
  { id:'leo-santos',userId:'u-leo',name:'Leo Santos',year:2022,programId:'education',motto:'Keep learning, keep giving.',bio:'Leo credits his mentors and classmates for teaching him that good questions can change a life.',portrait:'/portraits/leo.jpg',visibility:'public',status:'published' },
  { id:'nina-patel',userId:'u-nina',name:'Nina Patel',year:2022,programId:'arts',motto:'Collect moments, not milestones.',bio:'From campus theatre to quiet library afternoons, Nina found a home in the stories people shared.',portrait:'/portraits/nina.jpg',visibility:'public',status:'published' },
  { id:'alex-morgan',userId:'u-alex',name:'Alex Morgan',year:2019,programId:'business',motto:'Stay curious and stay kind.',bio:'Alex remembers a campus full of possibility, and the people who turned it into a community.',portrait:'/portraits/alex.jpg',visibility:'public',status:'published' },
  { id:'samira-ali',userId:'u-samira',name:'Samira Ali',year:2019,programId:'engineering',motto:'There is always another way.',bio:'Samira found her people in the lab: patient problem solvers and generous friends.',portrait:'/portraits/samira.jpg',visibility:'public',status:'published' },
  { id:'elijah-brooks',userId:'u-elijah',name:'Elijah Brooks',year:2016,programId:'education',motto:'Leave a light on for someone else.',bio:'A classroom volunteer then and a teacher now, Elijah still carries the generosity of his batch.',portrait:'/portraits/elijah.jpg',visibility:'public',status:'published' }
];
export const memories: Memory[] = [
  {id:'m1',ownerId:'u-maya',author:'Maya Chen',year:2024,schoolYear:'2023–24',title:'The last evening in the studio',body:'We stayed long after the final critique, sitting on the floor with paper cups of coffee. Nobody wanted to be the first to say goodbye.',image:'/memories/studio.jpg',caption:'One final evening together',visibility:'public',status:'published',featured:true,createdAt:'2024-06-08T12:00:00Z',reactionCount:18,commentCount:2},
  {id:'m2',ownerId:'u-leo',author:'Leo Santos',year:2022,schoolYear:'2021–22',title:'Our little corner of the library',body:'Every exam week, the same table somehow became ours. We shared notes, snacks, and a promise that we would make it through together.',image:'/memories/library.jpg',caption:'The library after class',visibility:'public',status:'published',featured:true,createdAt:'2022-05-20T09:00:00Z',reactionCount:12,commentCount:1},
  {id:'m3',ownerId:'u-alex',author:'Alex Morgan',year:2019,schoolYear:'2018–19',title:'When the whole campus sang',body:'The lights went out during the spring celebration, and instead of leaving, everyone started singing. It is still the moment I think of when someone says home.',image:'/memories/campus.jpg',caption:'A campus evening',visibility:'public',status:'published',featured:true,createdAt:'2019-04-14T09:00:00Z',reactionCount:25,commentCount:3}
];

