# prereq-flow

Prereq Flow is an unofficial course planning aid for University of Washington students that visualizes courses and prerequisites in undergraduate degrees.

Powered by [React Flow](https://reactflow.dev/) in the front and [FastAPI](https://fastapi.tiangolo.com/) in the back. Built with [Snowpack](https://www.snowpack.dev/) and hosted on [Vercel](https://vercel.com/).

Live here: https://prereqflow.com

## Todo
<dl>
  <dt><strong>UW course search</strong></dt>
  <dd>Currently the list of supported UW courses that provides autocomplete for the searchbar is loaded from a JSON file, whose size grows with the number of supported courses. To fix this, autocomplete logic will be moved to the back end. <strong>Until this is finished, no new degrees or courses will be added.</strong></dd>
</dl>

<br/>

## Supported Majors

Degree courses [here](https://github.com/andrew-1135/prereq-flow-degrees).

### College of Engineering
* Aeronautical and Astronautical Engineering
* Bioengineering
    * Data Science
    * Nanoscience and Molecular Engineering
* Chemical Engineering
    * Nanoscience and Molecular Engineering
* Civil Engineering
* Computer Engineering
* Computer Science
    * Data Science
* Electrical Engineering
* Environmental Engineering
* Human Centered Design and Engineering
* Industrial Engineering
* Materials Science and Engineering
    * Nanoscience and Molecular Engineering
* Mechanical Engineering
    * Biomechanics
    * Mechatronics
    * Nanoscience and Molecular Engineering

<br/>

## Supported Courses

### College of Arts and Sciences
<table>
  <tr>
    <td>Applied Mathematics</td>
    <td>AMATH</td>
  </tr>
  <tr>
    <td>Biology</td>
    <td>BIOL</td>
  </tr>
  <tr>
    <td>Comparative Literature</td>
    <td>C LIT</td>
  </tr>
  <tr>
    <td>Chemistry</td>
    <td>CHEM</td>
  </tr>
  <tr>
    <td>Economics</td>
    <td>ECON</td>
  </tr>
  <tr>
    <td>English</td>
    <td>ENGL</td>
  </tr>
  <tr>
    <td>Linguistics</td>
    <td>LING</td>
  </tr>
  <tr>
    <td>Mathematics</td>
    <td>MATH</td>
  </tr>
  <tr>
    <td>Physics</td>
    <td>PHYS</td>
  </tr>
  <tr>
    <td>Psychology</td>
    <td>PSYCH</td>
  </tr>
  <tr>
    <td>Sociology</td>
    <td>SOC</td>
  </tr>
  <tr>
    <td>Statistics</td>
    <td>STAT</td>
  </tr>
</table>

<br/>

### College of Engineering
<table>
  <tr>
    <td>Aeronautics and Astronautics</td>
    <td>A A</td>
  </tr>
  <tr>
    <td>Bioengineering</td>
    <td>BIOEN</td>
  </tr>
  <tr>
    <td>Civil and Environmental Engineering</td>
    <td>CEE</td>
  </tr>
  <tr>
    <td>Chemical Engineering</td>
    <td>CHEM E</td>
  </tr>
  <tr>
    <td>Computer Science and Engineering</td>
    <td>CSE</td>
  </tr>
  <tr>
    <td>Electrical and Computer Engineering</td>
    <td>E E</td>
  </tr>
  <tr>
    <td>Engineering</td>
    <td>ENGR</td>
  </tr>
  <tr>
    <td>Human Centered Design and Engineering</td>
    <td>HCDE</td>
  </tr>
  <tr>
    <td>Industrial Engineering</td>
    <td>IND E</td>
  </tr>
  <tr>
    <td>Mechanical Engineering</td>
    <td>M E</td>
  </tr>
  <tr>
    <td>Materials Science and Engineering</td>
    <td>MSE</td>
  </tr>
  <tr>
    <td>Nanoscience and Molecular Engineering</td>
    <td>NME</td>
  </tr>
</table>

<br/>

### College of the Environment
<table>
  <tr>
    <td>Atmospheric Sciences</td>
    <td>ATM S</td>
  </tr>
  <tr>
    <td>Bioresource and Science Engineering</td>
    <td>BSE</td>
  </tr>
  <tr>
    <td>College of the Environment</td>
    <td>C ENV</td>
  </tr>
  <tr>
    <td>Program on the Environment</td>
    <td>ENVIR</td>
  </tr>
  <tr>
    <td>Environmental Science and Resource Management</td>
    <td>ESRM</td>
  </tr>
  <tr>
    <td>Earth and Space Sciences</td>
    <td>ESS</td>
  </tr>
  <tr>
    <td>Friday Harbor Labs</td>
    <td>FHL</td>
  </tr>
  <tr>
    <td>Aquatic and Fishery Sciences</td>
    <td>FISH</td>
  </tr>
  <tr>
    <td>Marine Biology</td>
    <td>MARBIO</td>
  </tr>
  <tr>
    <td>Oceanography</td>
    <td>OCEAN</td>
  </tr>
  <tr>
    <td>Quantitative Science</td>
    <td>Q SCI</td>
  </tr>
  <tr>
    <td>School of Marine and Environmental Affairs</td>
    <td>SMEA</td>
  </tr>
</table>

<br/>

### School of Medicine
<table>
  <tr>
    <td>Bioethics and Humanities</td>
    <td>B H</td>
  </tr>
</table>

<br/>

### The Information School
<table>
  <tr>
    <td>Informatics</td>
    <td>INFO</td>
  </tr>
  <tr>
    <td>Information Technology Applications</td>
    <td>ITA</td>
  </tr>
  <tr>
    <td>Library and Information Science</td>
    <td>LIS</td>
  </tr>
</table>

<br/>

### Undergraduate Interdisciplinary Programs
<table>
  <tr>
    <td>Honors</td>
    <td>HONORS</td>
  </tr>
</table>

<br/>

## License
MIT
