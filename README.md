# Projektarbeit Master Digital Business


<h4 align="center">
Umsetzung einer Gesichtserkennungsanwendung mittels Serverless-Computing in AWS
</h4>
<p align="center">
<img src='./aws.jpg' width=400>
</p>
<h5 align="center">
<br>
Projektarbeit Digital Business Master
<br>
Wintersemester 2022/2023 
<br>
Simon Schwegler (35326) & Oliver Hagel (30306)
<br>
HS Ravensburg Weingarten
<br>
Betreuender Professor: Prof. Dr. rer. nat. Thomas Bayer
</h5>


## Ziel

Das Ziel der vorliegenden Projektarbeit war die Implementierung eines serverlosen Backends zur automatisierten Gesichtserkennung.
Ein User soll hierbei die Möglichkeit haben sich zu registieren, anzumelden oder seinen Account zu löschen.
Die Authentifizierung sollte einerseits als klassischer REST-API Endpunkt realisiert werden (Request-Response).
Andererseit sollte zusätzlich ein Event-Driven Ansatz über eine Benachrichtigung implementiert werden. 
Die Anwendung soll mittels AWS SAM und den damit verbundenen AWS-Diensten realisiert werden. Hierbei steht insbesondere der Dienst
AWS Rekognition, zur Gesichtserkennung, im Fokus.

## Architektur

Die folgende Abbildung zeigt die Architektur des Projektes:

<p align="center">
<img src='./architektur.png' width=800>
</p>

Im folgenden erfolgt eine genauere Beschreibung der verwendeten Ressourcen und Funktionalitäten:

### 1.Ressourcen #

1.1 **Web-APP**:
Der Fokus der Arbeit liegt auf der Implementierung des Backend. Dennoch wurde im Zuge der Realisierung des Projektes eine Web-Anwendung implementiert (REACT.JS).
Hierdurch können die implementierten Funktionalitäten des Backends einfacher getestet werden. Die Kommunikation erfolgt über HTTP. Das Frontent wurde in das SAM Template aufgenommen 
und mittels ***AWS Amplify*** deployed 

1.2 **REST-API**:
Damit die angebotenen Dienste öffentlich zugänglich sind und somit auch vom Frontend aufgerufen werden können, wird eine REST-API benötigt. 
Diese wird über den AWS Dienst ***Amazon API Gateway*** realisiert. Der Dienst wird mit ***Lambda Funktionen*** integriert, so dass jeder angebotene Endpunkt mit genau einer Funktion verbunden ist.

1.3 **Smartphone**: Damit ein Nutzer bei der Event-basierten Authentifizierung über das Ergebnis der Authentifizierung benachrichtigt wird, 
wird ein Smartphone benötigt. 

1.4 **S3 Bucket**: Dieser Bucket dient zur Ablage der hochgeladenen Bilder der registrierten Nutzer. Jedes Bild hat eine eindeutige URL und kann daher direkt vom 
Frontend bezogen werden.

1.5 **DynamoDB**: Es wird eine DynamoDB Tabelle benötigt. Diese speichert neben den angesprochenen Bild-Urls weitere Informationen zu einem Nutzer ab.

1.6 **AWS Rekognition**: Das Herzstück der Anwendung stellt dieser Service dar. Dieser Dienst stellt zahlreiche Funktionalitäten für die Bildanalyse bereit.

1.7 **SNS Topic**: Das Topic dient in der Anwendung zur Benachrichtigung eines Nutzers über das Authentifizierungsergebnises über eine SMS.

1.8 **S3 Bucket**: Der zweite Bucket dient für die Event-basierte Authentifizierung, indem der Client direkt ein Bild in den Bucket lädt, welches im Folgenden
analysiert werden soll.


### 2. Funktionalitäten #

2.1 **Registrieren**: 

2.1 **Authentifizieren (REST)**:

2.1 **Nutzer löschen**:

2.1 **Alle Nutzer anzeigen**:

2.1 **Anfrage zum direkten Upload in ein Bucket**:

2.1 **Authentifizierung (Event-basiert)**:





## Beschreibung des Stacks

Demo-Version:

https://main.dl3jjjbkssvqc.amplifyapp.com/


# Deployment

## Vorraussetzungen

Um SAM lokal ausführend zu können, wird die AWS CLI benötigt. Daher muss diese installiert werden.

https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-windows.html

Zudem muss die SAM CLI installiert sein:

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

Im Anschluss muss die lokale Entwicklungsumgebung noch mit einem AWS-Account verknüpft werden:

```
aws configure
```

Folgende Konfigurationen werden vorgenommen:

AWS Access Key ID: <Ihr AWS Access Key> <br>
AWS Secret Access Key: <Ihr Secret> <br>
Default region name: eu-central-1 <br>
Default output format. json <br>

## Vorgehen für das Deployment

Bevor der Anwendungsstack deployed werden kann, müssen sämtliche Abhängigkeiten installiert werden.
Werden diese nicht installiert, stehen einzelne Funktionen des serverlosen Backends nicht zur Verfügung, da bei der Ausführung Fehler entstehen. Dies betrifft alle Funktionen, die eine eigene package.json besitzen und daher NPM-Module nutzen.

Nach einem Build kann das Backend in die AWS-Cloud deployed werden.

## Build

Serverless Backend builden

```
sam build
```

## Deployment

Initiales Deployment:

Ein initiales Deployment wird über folgenden Befehl gestartet:

```
sam deploy -g
```

Hierbei werden Parameter durch den Nutzer an den zu erzeugenden Stack mitgegeben:

Innerhalb des Projektes werden innerhalb der samconfig.toml alle übergebenen Parameter gespeichert und bei einem weiteren Deployment ausgelesen.

Die Parameter werden im Folgenden beschrieben:

- PhoneNumber: Handynummer zum Empfangen des Authentifizierungsergebnises. Da da Projekt nur innerhalb einer Sandbox ausgeführt wird, muss die angegebene Nummer im Anschluss noch verifiziert werden (siehe )
- DeployWithAmplify: true/false - Soll das Frontend über Amplify deployed werden. Ist dem so, müssen gültige Parameter für die nachfolgenden Parameter angegeben werden. Wenn kein Token oder kein Github-Repositorium vorliegt, muss hierbei false angegeben  
  werden.
- GithubRepository: Link zu einem hinterlegten GitHub-Repositorium. Dieses muss dieses Projekt enthalten (Frontend + Backend).
  Das Repositorium wird für das Hosting mittels AWS Amplfify benötigt. Wird nur benötigt wenn DeployWithAmplify auf 'true' gesetzt wird.
- PersonalAcessToken: Token für den Zugriff von auf das Github-Repo - Muss angegeben werden, wenn das Frontend deployed werden soll.
- Branch: Github-Repo Branch des Frontend, der deployed werden soll - Wird nur benötigt wenn DeployWithAmplify auf 'true' gesetzt wird.

Alle weiteren Konfigurationen können mit 'yes' oder mit mit dem Default konfiguriert werden.
Wird das Frontend nicht über Amplify deployed ( DeployWithAmplify=false), können die letzten oben genannten drei Parameter einfach ignoriert oder mit einem beliebigen Wert konfiguriert werden.

Token kann wie folgt erzeugt werden:
https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token

Sollten im Anschluss Änderungen gemacht werden, startet folgender Befehl das Deployment:

```
sam deploy
```

Hierbei müssen die Parameter nicht ein zweites Mal übergeben werden.

## Bereitstellen des Frontends

Das Frontend lässt sich nach dem Deployment des serverlosen Backends lokal ausführen.
Informationen für die lokale Ausführung befinden sich innerhalb der README.md des Frontend (/client)

Wird das Frontend über Amplify deployed, müssen noch drei Befehle ausgeführt werden. Diese können dem Output nach einem erfolgreichen Deployment entnommen werden.

Alterativ kann folgender Befehl ausgeführt werden, um die Befehle zu erhalten:

```
aws cloudformation describe-stacks --stack-name <Name des Stacks>
```

Bei der Ausführung der folgenden Commands sollte darauf geachtet werden, dass diese innerhalb einer Zeile ausgeführt werden. Beim Kopieren können unerwünschte Zeilenumbrüche entstehen, sodass nur ein Teil eines Commands ausgeführt wird.
Daher gegebenenfalls den generierten Command vor der Ausführung noch formatieren.

Die Commands werden für jeden Stack inital erzeugt und werden dem Output nach einem Deployment entnommen. Entprechend wird eine 1:1-Ausführung der Beispiels-Commands nicht funktionieren.

1. Cors-Header der erstellten Http API konfigurieren. Der auszuführende Command kann dem SAM-Output entnommen werden.

Format des Commands:

```
aws apigatewayv2 update-api --api-id 8aco6poc6c --cors-configuration AllowOrigins=https://main.d3ovku2thzo8rv.amplifyapp.com,http://localhost:8080
```

2. Entwicklungsvaribalen für das Frontend anpassen. Form des Commands:

```
aws amplify update-app --app-id do68bi531l99o --environment-variables VUE_APP_API_ROOT=cogtest,VUE_APP_REGION=eu-central-1,VUE_APP_USER_POOL_ID=eu-central-1_QI3YWvRUC,VUE_APP_CLIENT_ID=3rcu02qt5umvvqp898e0d1e6s6,VUE_APP_URL=https://cogtest-457908813616.auth.eu-central-1.amazoncognito.com
```

Diese Vorgehensweise ist nur bei einem intitalen Deployment nötig. Im Anschluss wird nach jeder Änderung des hinterlegten Git-Repos das Deployment automatisch durch Amplify gestartet.

3. Build und Deploy des Frontend im Anschluss starten

Form:

```
aws amplify start-job --app-id <MyAmplifyAppId> --branch-name <BranchName> --job-type RELEASE
```

Der benötigte Befehl kann auch dem Output innerhalb der Konsole entnommen werden.

## Anwendungsstack löschen

Soll die Anwendung gelöscht werden, muss dies über die AWS Management Console erfolgen. Hierbei muss der Dienst CloudFormation geöffnet werden.
Innerhalb einer Übersicht aller vorhandener Stacks kann hierbei der zu löschende Stack markiert und gelöscht werden.


# Literaturverzeichnis