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


## Version 4.0 — Archives de runs
- Ajout d'une action « Archiver » à côté de « Effacer » dans l'en-tête de l'historique.
- L'action regroupe toutes les runs terminées et non encore archivées par deck en une « Run archive » par deck.
- La date de chaque archive correspond à la date de la dernière run du groupe.
- Les archives précédentes restent intactes et ne sont jamais intégrées aux nouvelles archives.
- Les parties sont conservées dans les archives et continuent de contribuer une seule fois aux statistiques globales.
- Le cache du service worker est versionné pour permettre le chargement des nouveaux fichiers.
