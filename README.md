# Record (Wizards Run) V4.5 — mise à jour

Évolutions depuis la V4.2 :
- histogramme Death / OK / Flood avec le nombre de parties dans chaque segment ;
- suppression du caractère « % » dans les valeurs affichées à l'intérieur ou aux extrémités des histogrammes ;
- seuil des combinaisons de couleurs adverses abaissé à strictement plus de 6 % des parties du filtre courant ; les autres combinaisons sont regroupées dans Others ;
- les combinaisons de couleurs affichent les lettres avant les pictogrammes, dans l'ordre WUBRG (par exemple UR puis les pictogrammes bleu et rouge) ;
- le WR de chaque combinaison est accompagné de sa part du field, calculée sur toutes les parties enregistrées, indépendamment du filtre de deck.

La clé de stockage locale reste `wizards-run-v2` afin de conserver les données des versions précédentes.
# Wizards Run V3.5

Évolutions depuis V3.4 :
- libellés des taux abrégés en « WR » dans les statistiques globales ;
- ajout d'une ligne « Others » regroupant les parties des combinaisons de couleurs adverses qui ne dépassent pas 7 % des parties du filtre courant ;
- ajout de deux histogrammes de répartition des résultats : parties jouées en Play et parties jouées en Draw ;
- ajout d'un filtre des statistiques globales permettant d'afficher toutes les données ou un deck précis ;
- affichage des pourcentages Play / Draw directement aux extrémités de l'histogramme ;
- affichage du pourcentage de parties sans 3 lands au tour 3 à droite de l'histogramme.

Les données restent stockées localement dans le navigateur. La version conserve la clé de stockage utilisée par les versions précédentes.


## Version 3.5.1
- Le pourcentage des parties sans 3 lands au tour 3 reste aligné à droite, dans la zone rouge de l’histogramme.
- Les statistiques Play/Draw et les répartitions des résultats en Play et en Draw sont regroupées dans un seul bloc PLAY / DRAW.
- Ajout du WR par archétype adverse, sous le WR par combinaison de couleurs.


## Version 3.5.3
- Suppression des libellés « PLAY / DRAW » et « Répartition PLAY / DRAW » : le bloc commence directement par l’histogramme.
- Réduction maximale de l’espace vertical entre les histogrammes des résultats en Play et en Draw.
- Dans l’histogramme « 3 lands T3 », affichage des seuls pourcentages : Oui à gauche et Non à droite, sans libellés textuels.


## Version 4.1 — Archives de runs
- Ajout d'une action « Archiver » à côté de « Effacer » dans l'en-tête de l'historique.
- L'action regroupe toutes les runs terminées et non encore archivées par deck en une « Run archive » par deck.
- La date de chaque archive correspond à la date de la dernière run du groupe.
- Les archives précédentes restent intactes et ne sont jamais intégrées aux nouvelles archives.
- Les parties sont conservées dans les archives et continuent de contribuer une seule fois aux statistiques globales.
- Le cache du service worker est versionné pour permettre le chargement des nouveaux fichiers.


## Version 4.1
- Les archives affichent les statistiques sans la liste des parties jouées.
- Un bouton « Effacer » dans l’en-tête permet de supprimer une archive sélectionnée après confirmation.


## Version 4.2
- Les archives présentent les statistiques comme l’accueil : WR global, répartition des résultats, répartition de la mana avec WR Mana OK/Flood et statistiques WR 3 lands T3.
- La liste des parties reste masquée dans une archive.
- Cache du service worker renouvelé pour forcer la mise à jour des fichiers de l’application.


V4.4 : l’histogramme de répartition Mana Death / OK / Flood affiche les pourcentages de chaque segment plutôt que le nombre de parties. Les WR Mana OK et WR Mana Flood restent inchangés.


## Version 4.5
- Ajout du taux de victoire des parties classées Death dans le bloc de statistiques mana.
- Les trois taux sont affichés dans l’ordre : « WR Death », « OK » et « Flood », chacun avec son pourcentage.
- Modification appliquée aux statistiques globales et aux statistiques des archives.


## Mise à jour V4.5 — navigation et présentation
- Le bloc de WR par mana affiche uniquement les trois indicateurs : WR Death, WR OK et WR Flood.
- L’historique est trié de la run/archive la plus récente à la plus ancienne.
- Dans une archive, des commandes « Archive précédente » et « Archive suivante » permettent de naviguer depuis le bloc WR global ; les boutons sont désactivés lorsqu’il n’existe pas d’archive dans cette direction.
- Ajout de l’histogramme Play/Draw et des WR Play/Draw dans les statistiques d’une archive.
- Le titre affiché de l’application devient « Record » (titre de page et nom de l’application installée).
- La clé localStorage `wizards-run-v2` est conservée pour préserver les données existantes.


## Version 4.6
- Les cartes des runs et des archives sont teintées selon le rang : vert pâle pour Platine, violet pâle pour Diamant et rouge pâle pour Mythic. Pour une archive regroupant plusieurs rangs, la teinte correspond au rang le plus élevé représenté dans le groupe.
- Ajout du WR directement dans chaque carte de run, y compris la run en cours et les archives.
- Le stockage local `wizards-run-v2` reste inchangé.


## Version 5 — BO3
Switch BO1 / BO3, statistiques séparées par format, score BO3 2/0 2/1 1/2 0/2, résultat de première manche, pas de suivi mana/3 terrains en BO3. Archives séparées par format. Les données BO1 restent compatibles.
