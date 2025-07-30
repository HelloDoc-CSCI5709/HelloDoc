echo "Select what to run:"
echo "1) Frontend only"
echo "2) Backend + Mongo + SonarQube"
echo "3) Full stack"
echo "4) SonarQube + Postgres for SonarQube"
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    docker compose -f docker-compose.dev.yml up frontend
    ;;
  2)
    docker compose -f docker-compose.dev.yml up backend mongo mongodb_view sonarqube postgres_sonarqube
    ;;
  3)
    docker compose -f docker-compose.dev.yml up
    ;;
  4)docker compose -f docker-compose.dev.yml up sonarqube postgres_sonarqube
    ;;
  *)
    echo "Invalid choice"
    ;;
esac
