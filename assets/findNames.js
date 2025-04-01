import nlp from "https://esm.sh/compromise"

let doc = nlp(`### Gordon Ashworth Glanville: A Life of Service and Sacrifice

Gordon Ashworth Glanville was born on July 13, 1893, in Stephen, Huron County, Ontario, Canada, although some records also list Crediton, Ontario as his birthplace. The son of George Benjamin Glanville (1853–1944) and Alma Eunice Young (1861–1933), Gordon's early life was marked by the influence of a family rooted in both agriculture and service. His father, George, was a prominent figure, and Gordon followed a path that would intertwine with both military and civilian endeavors.

#### Early Life and Military Service in Canada

Growing up in a family connected to farming and community life, Gordon Glanville's early years were shaped by the rural lifestyle of Ontario. He enlisted in the Canadian Expeditionary Force during World War I and became a Private with the 31st Battalion, serving in the trenches of Europe. His service number was 3207491, and he proved to be a steadfast soldier during a time of great adversity. Glanville’s unit was involved in various key operations during the war, contributing to the Allied effort to stem the tide of the German offensive.

The 31st Battalion, where Glanville served, was one of many Canadian units that formed a significant part of the Allied forces. As a soldier, Glanville’s experiences would have been shaped by the horrors of trench warfare, and the camaraderie of men who fought for their lives and for the ideals of freedom.

#### Transition to the Royal Air Force

After World War I, Gordon Glanville's story took an unexpected turn. In 1941, during the height of World War II, he moved to England and joined the Royal Air Force Volunteer Reserve (RAFVR). By then, he had gained extensive experience and skills that made him well-suited for the demands of air warfare. He became a Wireless Operator/Air Gunner and was assigned to 408 Squadron, part of the Royal Canadian Air Force (RCAF), based at RAF Balderton in Nottinghamshire, England.

It was here, in the service of the Royal Air Force, that Glanville would make his final contribution to the war effort.

#### The Fateful Mission and Death

On the night of January 10, 1942, Glanville was aboard Handley Page Hampden I aircraft AE286 as part of a mission over Wilhelmshaven, Germany. Unfortunately, AE286 failed to return, and all four crew members perished. The aircrew consisted of:

- **Sergeant Leslie Alexander Churcher** (RAFVR)
- **Sergeant Gordon Arthur Glanville** (RAFVR)
- **Flight Sergeant Donald Louden Henderson** (RCAF)
- **Flight Lieutenant Thomas Findlay Priest** (RAFVR)

Their sacrifice on this fateful mission highlighted the risks faced by aircrews during World War II. The aircraft’s failure to return marked a grim chapter in the history of 408 Squadron and the broader Allied efforts during the war. Glanville, along with his fellow crew members, was commemorated by the Commonwealth War Graves Commission, ensuring that their memory would live on despite the absence of a known grave.

#### Commemoration and Legacy

Gordon Ashworth Glanville is commemorated at the **Runnymede Memorial** in the United Kingdom, a site that honors the sacrifice of airmen who lost their lives during World War II but have no known grave. The memorial stands as a poignant reminder of the many individuals who served and sacrificed for the greater good.

Beyond his military service, Gordon Ashworth Glanville’s story is also a family story, tied to his roots in Ontario. His father, George Benjamin Glanville, and mother, Alma Eunice Young, provided the foundation for a life that would later span both Canadian and British service. The Glanville family, with their rich history, continues to be part of the larger narrative of military service and sacrifice.

Gordon's final resting place is remembered through the **Commonwealth War Graves Commission** and other memorials dedicated to those who gave their lives during the Second World War.

#### Family and Later Life

Gordon Ashworth Glanville’s life, however, was not confined solely to the battlefield. He was part of a family legacy, with his father and mother deeply influential in shaping his values. His mother, Alma, passed away in 1933, and his father lived until 1944, just two years after Gordon’s death. The Glanville family’s story is one of both contribution and tragedy, with Gordon's ultimate sacrifice reflecting the depth of commitment shared by many who served.

In the years following his death, Gordon’s memory would be carried on by the Commonwealth and his surviving family members. Born in 1893, he lived through some of the most turbulent times in history, from the battles of World War I to the aerial warfare of World War II. His story is a reminder of the sacrifices made by individuals who served their countries in times of need.

#### Conclusion

Gordon Ashworth Glanville’s life and service reflect the enduring spirit of sacrifice and duty that marked the experiences of countless Canadians and Britons during the world wars. His early years in Canada, military service during World War I, and tragic death during World War II contribute to a legacy that will never be forgotten. Today, Glanville’s name lives on through memorials, family history, and the gratitude of nations that honor the memory of those who gave everything for their countries.

#### References

- **Glanville Family History** – [Glanville.net](http://www.glanvillenet.info/UK_Glanville/g0/p365.htm)
- **Canadian Great War Project** – [Gordon Ashworth Glanville Profile](https://canadiangreatwarproject.com/person.php?pid=102652)
- **RAF Commands Database** – [Gordon Ashworth Glanville and the 408 Squadron](https://www.rafcommands.com/database/wardead/details.php?qnum=62478)
- **Find a Grave** – [Gordon Ashworth Glanville Memorial](https://www.findagrave.com/memorial/15253448/gordon-arthur-glanville)`)
const filteredData = doc.people().json().map(item => {
  // Extract firstName and lastName from the terms
  const firstNameTerm = item.terms.find(term => term.tags.includes("FirstName"));
  const lastNameTerm = item.terms.find(term => term.tags.includes("LastName"));

  // Ensure both firstName and lastName are not empty
  const firstName = firstNameTerm ? firstNameTerm.text : null;
  const lastName = lastNameTerm ? lastNameTerm.text : null;

  // If either firstName or lastName is null, skip this item
  if (!firstName || !lastName) {
    return null;
  }

  // Return the new format as an object with firstName, lastName, and fullText
  return {
    firstName,
    lastName,
    fullText: `${firstName} ${lastName}`
  };
}).filter(item => item !== null); // Remove any null items

 

const uniqueNames = Array.from(new Set(filteredData.map(a => a.fullText)))
  .map(fullText => filteredData.find(item => item.fullText === fullText));

console.log(uniqueNames);
