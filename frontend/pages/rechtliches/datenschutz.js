import Layout from "@/components/Layout";
import Image from "next/image";

function Datenschutz() {
    return (
        <Layout title="Datenschutz" noindex={true}>
            <div className="container mx-auto flex flex-col pt-32 md:pt-40 px-4">
                <h1 className="lg:text-4xl text-2xl font-extrabold lg:leading-tight mb-2">
                    Datenschutz
                </h1>
                <p>
                    Diese Datenschutzerklärung soll die Nutzer dieser Website gemäß Bundesdatenschutzgesetz und Telemediengesetz über die Art, den Umfang und den Zweck der Erhebung und Verwendung personenbezogener Daten durch den Websitebetreiber informieren. <br /><br />

                    Wir nehmen Datenschutz sehr ernst und behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Vorschriften. <br /><br />

                    Bedenken Sie, dass die Datenübertragung im Internet grundsätzlich mit Sicherheitslücken bedacht sein kann. Ein vollumfänglicher Schutz vor dem Zugriff durch Fremde ist nicht realisierbar.
                </p>
                <h2 className="text-2xl font-bold mt-10">I. Verantwortliche/r</h2>
                <p>
                    Verantwortliche/r im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze der Mitgliedsstaaten sowie sonstiger datenschutzrechtlicher Bestimmungen ist: <br /><br />
                    <Image src="/images/anschrift.png" alt="" width={158} height={50} />
                    <span className="font-light">Email: support@YOUR_DOMAIN.COM</span>
                </p>
                <h2 className="text-2xl font-bold mt-10">II. Allgemeines zur Datenverarbeitung</h2>
                <h3 className="text-xl font-bold">a. Welche Daten werden für welchen Zweck verarbeitet?</h3>
                <p>
                    Bei jedem Zugriff auf Inhalte der Website werden vorübergehend Daten gespeichert, die möglicherweise eine Identifizierung zulassen. Die folgenden Daten werden hierbei erhoben: <br /><br />

                    - Datum und Uhrzeit des Zugriffs <br />
                    - IP-Adresse <br />
                    - Website, von der aus die Website aufgerufen wurde <br />
                    - Websites, die über die Website aufgerufen werden <br />
                    - Besuchte Seite auf unserer Website <br />
                    - Meldung, ob der Abruf der Website erfolgreich war <br />
                    - Übertragene Datenmenge <br />
                    - Informationen über den Browsertyp und die verwendete Version <br />
                    - Betriebssystem <br /><br />

                    Die vorübergehende Speicherung der Daten ist für den Ablauf eines Websitebesuchs erforderlich, um eine Auslieferung der Website zu ermöglichen. Eine weitere Speicherung in Protokolldateien erfolgt, um die Funktionsfähigkeit der Website und die Sicherheit der informationstechnischen Systeme sicherzustellen. In diesen Zwecken liegt auch unser berechtigtes Interesse an der Datenverarbeitung.
                </p>
                <h3 className="text-xl font-bold mt-4">b. Auf welcher Rechtsgrundlage werden diese Daten verarbeitet?</h3>
                <p>
                    Die Daten werden auf der Grundlage des Art. 6 Abs. 1 Buchstabe f DS-GVO verarbeitet.
                </p>
                <h3 className="text-xl font-bold mt-4">c. Gibt es neben dem Verantwortlichen weitere Empfänger der personenbezogenen Daten?</h3>
                <p>
                    Die Website wird bei DigitalOcean Holdings, Inc. gehostet. Der Hoster empfängt die oben genannten Daten als Auftragsverarbeiter.
                </p>
                <h3 className="text-xl font-bold mt-4">d. Wie lange werden die Daten gespeichert?</h3>
                <p>
                    Die Daten werden gelöscht, sobald sie für die Erreichung des Zwecks ihrer Erhebung nicht mehr erforderlich sind. Bei der Bereitstellung der Website ist dies der Fall, wenn die jeweilige Sitzung beendet ist. Die Protokolldateien werden direkt und ausschließlich für Administratoren zugänglich aufbewahrt. Danach sind sie nur noch indirekt über die Rekonstruktion von Sicherungsbändern verfügbar und werden nach vier Wochen endgültig gelöscht.
                </p>
                <h2 className="text-2xl font-bold mt-10">III. Betroffenenrechte</h2>
                <p>
                    Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener i.S.d. DSGVO und es stehen Ihnen folgende Rechte gegenüber dem Verantwortlichen zu: <br /><br />

                    - Recht auf Auskunft <br />
                    - Recht auf Widerspruch <br />
                    - Recht auf Berichtigung <br />
                    - Recht auf Löschung <br />
                    - Recht auf Einschränkung der Verarbeitung <br />
                    - Recht auf Beschwerde <br />
                    - Recht auf Datenübertragbarkeit <br /><br />

                    Für die Ausübung Ihrer Rechte oder für weitere Fragen zum Datenschutz können Sie uns unter support@YOUR_DOMAIN.COM erreichen.
                </p>
                <h2 className="text-2xl font-bold mt-10">IV. Verwendung von Cookies</h2>
                <p>
                    Unsere Webseite verwendet so genannte &quot;Cookies&quot;. Bei Cookies handelt es sich um kleine Textdateien, die auf Ihrem Rechner abgelegt werden und die Ihr Browser speichert. Diese dienen dazu, unser Angebot für Sie nutzerfreundlicher und effektiver zu machen. <br /><br />

                    Sie können die Verwendung von Cookies dadurch unterbinden, indem Sie Ihren Internetbrowser so einstellen, dass dieser keine Cookies akzeptiert. Sie können in Ihren Browser aber auch festlegen, ob Sie über das Setzen von Cookies informiert werden möchten und Cookies nur im Einzelfall erlauben, ob Sie die Annahme von Cookies für bestimmte Fälle oder eben auch generell ausschließen. Außerdem können Sie das automatische Löschen der Cookies beim Schließen des Browser aktivieren. Wie man das macht, hängt von Ihrem Browser ab. 
                </p>
                <h2 className="text-2xl font-bold mt-10">V. Webanalyse</h2>
                <p>
                    Unter der Voraussetzung, dass Sie uns diesbezüglich Ihre Einwilligung erteilen (§ 25 TTDSG), werten wir das Nutzerverhalten aus, um unseren Internetauftritt für Sie und andere Benutzer möglichst bedarfsgerecht zu gestalten. Hierzu verwenden wir das Webanalyse-Tool Google Analytics, des US-amerikanischen Unternehmens Google LLC. Dieses Tool nutzt sogenannte &quot;Cookies&quot;, welche auf Ihrem Computer gespeichert werden. <br /> <br />
                
                    Sollten Sie mit der Analyse und Speicherung Ihrer Daten nicht (mehr) einverstanden sein, so haben Sie haben die Möglichkeit, Cookies jederzeit von Ihrem Gerät zu löschen. Die Vorgehensweise kann je nach verwendetem Browser unterschiedlich sein. In der Regel finden Sie die Cookie-Verwaltungsoptionen in den Einstellungen oder dem Datenschutzmenü Ihres Browsers. 
                </p>
                <h2 className="text-2xl font-bold mt-10">VI. Allgemeines zum Datenschutz</h2>
                <p>
                    Im Zuge der Weiterentwicklung des Internetangebotes können auch Änderungen dieser Datenschutzerklärung erforderlich werden. Wir empfehlen Ihnen deshalb, sich die Datenschutzerklärung von Zeit zu Zeit erneut durchzulesen. <br /><br />
                
                    Wir weisen darauf hin, dass Betreiber von fremden Internetseiten, die vom Portal aus verlinkt werden, die Daten von Besucherinnen bzw. Besuchern dieser Internetseiten erheben und auswerten können. <br /> <br />

                    Im Rahmen der Presse- und Öffentlichkeitsarbeit werden bei Veranstaltungen und Terminen Fotos und Videos aufgenommen, auf denen Sie gegebenenfalls erkennbar zu sehen sind. Der Aufnahme und/oder einer Veröffentlichung können Sie widersprechen. Bitte nutzten Sie für Ihren Widerspruch die oben genannten Kontaktdaten. <br /><br />

                    Diese Website enthält möglicherweise Verlinkungen zu externen Websites oder eingebettete Inhalte, darunter Bilder von Drittanbietern. Bitte beachten Sie, dass für diese externen Inhalte möglicherweise separate Datenschutzrichtlinien und Nutzungsbedingungen gelten.
                </p>
            </div>
        </Layout>
    );
}

export default Datenschutz;
