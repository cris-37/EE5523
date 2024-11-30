docker build -t backend-image:latest ./backend
docker build -t frontend-image:latest ./frontend

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/pv.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml

docker run -p 5000:5000 backend-image:latest
kubectl port-forward service/frontend-service 3000:80 -n resume-manager