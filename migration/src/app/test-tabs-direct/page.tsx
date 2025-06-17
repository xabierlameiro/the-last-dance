import { highlight } from "codehike/code"
import { CodeTabsDirectClient } from './CodeTabsDirectClient'

const tabs = [
  {
    meta: "index.tsx",
    value: `import React from 'react';
import styles from './knowledge.module.css';

type Props = {
    name?: string;
};

const App = ({ name = 'Xabier Lameiro' }: Props) => {
    return (
        <main className={\`\${styles.experience} \${styles.education}\`}>
            <h1>👋, me llamo {name}!</h1>
            <p>
                Soy desarrollador Frontend. He trabajado y trabajo en el sector
                bancario y retail para empresas como CaixaBank, Openbak e Inditex.
                Me gusta el desarrollo aplicaciones, automatizaciones y el IoT.
            </p>
        </main>
    );
};

export { App, App as default };`,
    lang: "tsx"
  },
  {
    meta: "knowledge.module.css",
    value: `:root {
    --html-css : 6 años;
    --javascript : 6 años;
    --typescript : 4.5 años;
    --react : 4.5 años;
    --redux : 3 años;
    --nextjs : 3.5 años;
    --gatsby : 1.5 años;
}

.experience {
    Hiberus : 1 año !important;
    Plexus Tech : 2 años;
    Orienteed : 1.5 años;
    Viewnext  : 1.5 años;
    Interlinea srl / Italia :  .4 años;
}

.education {
    Técnico Superior en Desarrollo de Aplicaciones Web : 2 años;
    Técnico en Sistemas Microinformáticos y Redes : 2 años;
}`,
    lang: "css"
  },
  {
    meta: "contact.json",
    value: `{
    "email": "xabier.lameiro@gmail.com",
    "phone": "+34 603 018 268"
}`,
    lang: "json"
  }
]

export default async function TestTabsDirectPage() {
  const highlighted = await Promise.all(
    tabs.map((tab) => highlight(tab, "github-dark")),
  )

  return (
    <div className="min-h-screen bg-black p-8">
      <h1 className="text-white text-2xl mb-4">Test CodeWithTabs Direct</h1>
      <div className="max-w-4xl">
        <CodeTabsDirectClient highlighted={highlighted} tabs={tabs} />
      </div>
    </div>
  )
}
