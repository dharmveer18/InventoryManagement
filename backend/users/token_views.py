from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.response import Response
from rest_framework import status

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response({
            'access': serializer.validated_data['access'],
            'refresh': serializer.validated_data['refresh'],
            'token_type': 'Bearer',
            'status': 'success'
        }, status=status.HTTP_200_OK)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response({
                'status': 'error',
                'detail': 'Token is invalid or expired',
                'code': 'token_not_valid'
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'access': serializer.validated_data['access'],
            'status': 'success'
        }, status=status.HTTP_200_OK)