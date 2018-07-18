import puppeteer = require("puppeteer");
import pug = require("pug");
import fs = require("fs");


const projectBoard = 'https://github.com/orgs/fabric8io/projects/2?fullscreen=true';


const card = 'a.js-project-card-issue-link'

const columns = {
  inProgress : '#column-cards-2307988',
  blocked : '#column-cards-2313160',
  done: '#column-cards-3019981',
}

interface card {
  text: string
  href: string
}

interface status {
  inProgress:  Array<card>
  done:  Array<card>
}

const cardsInPage = (page: puppeteer.Page) => ((column: string): Promise<Array<card>> => {
  return page.$$eval(
    `${column} ${card}`,
    (nodes:any) => nodes.map((n: any) => <card>{text: n.innerText, href: n.href } )
  )
})

const render = pug.compileFile('report.pug');

// fn to test the template
function renderHTML() {

  const data: status = {
    inProgress:
     [ { text: 'Build: Investigate what is required to support Springboot better',
         href: 'https://github.com/openshiftio/openshift.io/issues/3942' },
       { text: 'Build Multi Language Support Design',
         href: 'https://github.com/openshiftio/openshift.io/issues/3896' },
       { text: 'upgrade kubernetes client to support OpenShift 3.9 and Kubernetes 1.8/1.9',
         href: 'https://github.com/fabric8io/fabric8-maven-plugin/issues/1308' } ],
    done:
     [ { text: 'Switch to Quay for deploying to stage',
         href: 'https://github.com/fabric8-services/fabric8-jenkins-proxy/issues/313' },
       { text: 'Jenkins idler/proxy - Unable to determine tenant id for repo',
         href: 'https://github.com/openshiftio/openshift.io/issues/3252' },
      { text: 'Is this api supports Kubernetes Cron Job?',
         href: 'https://github.com/fabric8io/kubernetes-client/issues/770' },
       { text: 'content-repository update with latest caddy server update',
         href: 'https://github.com/openshiftio/openshift.io/issues/3952' } ]
  }

  const render = pug.compileFile('report.pug');

  // Render a set of data
  console.log(render(data))
  fs.writeFileSync('report.html', render(data))
}


async function main() {
  // DEBUG
  // const browser = await puppeteer.launch({headless: false});
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(projectBoard)
  await page.waitFor(5*1000)

  const cardsInColumn = cardsInPage(page)


  const inProgress = await cardsInColumn(columns.inProgress)
  const blocked = await cardsInColumn(columns.blocked)
  const done = await cardsInColumn(columns.done)

  browser.close();

  const data : status =  {
    inProgress: [...inProgress, ...blocked],
    done
  }

  fs.writeFileSync('report.html',render(data))
}

main()
